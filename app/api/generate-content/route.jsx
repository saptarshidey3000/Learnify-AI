import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import axios from 'axios';
import { db } from '@/config/db.jsx';
import { courseTable } from '@/config/schema.js';


const PROMPT = `Generate detailed content for each topic in the course chapter. CRITICAL: Return ONLY valid JSON with no line breaks in content strings. Return exactly this JSON structure: { "chapterName": "string", "topics": [ { "topic": "string", "content": "string (HTML formatted, use <br> instead of newlines)" } ] } IMPORTANT RULES: 1. NO line breaks (\\n) inside content strings - use <br> tags instead 2. Content should be 200-300 words per topic 3. Use HTML: <p>, <ul>, <ol>, <li>, <strong>, <em>, <code> 4. Keep all JSON on single lines (no pretty printing) 5. Escape all quotes inside content with \\" User Input:`;

const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

const getYoutubeVideos = async (topic) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured');
      return [];
    }

    const params = {
      part: 'snippet',
      q: topic,
      maxResults: 2,
      type: 'video',
      key: process.env.YOUTUBE_API_KEY,
      videoEmbeddable: true,
      relevanceLanguage: 'en'
    };

    const resp = await axios.get(YOUTUBE_BASE_URL, { params });
    
    return resp.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  } catch (error) {
    console.error(`Error fetching YouTube videos for topic "${topic}":`, error.message);
    return [];
  }
};

const generateChapterContent = async (chapterName, topics) => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const inputData = {
    chapterName,
    topics: topics.map(t => typeof t === 'string' ? t : t.topic || t)
  };

  const model = 'gemini-2.5-flash';
  let result;
  let retries = 3;

  while (retries > 0) {
    try {
      result = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: PROMPT + JSON.stringify(inputData, null, 2) }],
          },
        ],
      });
      break;
    } catch (error) {
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        retries--;
        if (retries > 0) {
          const waitTime = (4 - retries) * 5000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw new Error('Rate limit exceeded. Please wait a few minutes and try again.');
        }
      } else {
        throw error;
      }
    }
  }

  let fullText = '';
  if (result.response && typeof result.response.text === 'function') {
    fullText = result.response.text();
  } else if (result.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
    fullText = result.response.candidates[0].content.parts[0].text;
  } else if (result.text && typeof result.text === 'function') {
    fullText = result.text();
  } else if (typeof result.text === 'string') {
    fullText = result.text;
  } else {
    throw new Error('Unable to extract text from AI response');
  }

  let contentData;
  try {
    let cleanedText = fullText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    try {
      contentData = JSON.parse(cleanedText);
    } catch (firstError) {
      cleanedText = cleanedText.replace(
        /"content":\s*"([^"]*(?:\\.[^"]*)*)"/g,
        (match, content) => {
          const fixed = content
            .replace(/\\n/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/\\r/g, '');
          return `"content": "${fixed}"`;
        }
      );
      contentData = JSON.parse(cleanedText);
    }
  } catch (parseError) {
    try {
      const topicsMatch = fullText.match(/"topics":\s*\[([\s\S]*)\]/);
      const chapterMatch = fullText.match(/"chapterName":\s*"([^"]*)"/);

      if (topicsMatch && chapterMatch) {
        contentData = {
          chapterName: chapterMatch[1],
          topics: []
        };

        const topicsContent = topicsMatch[1];
        const topicBlocks = topicsContent.split(/},\s*{/);

        topicBlocks.forEach((block) => {
          const topicNameMatch = block.match(/"topic":\s*"([^"]*)"/);
          const contentMatch = block.match(/"content":\s*"([\s\S]*?)"\s*$/);

          if (topicNameMatch && contentMatch) {
            contentData.topics.push({
              topic: topicNameMatch[1],
              content: contentMatch[1]
                .replace(/\\n/g, ' ')
                .replace(/\n/g, ' ')
                .replace(/\\"/g, '"')
            });
          }
        });
      } else {
        throw new Error('Could not extract required fields');
      }
    } catch (repairError) {
      throw new Error(`AI generated invalid JSON format: ${parseError.message}`);
    }
  }

  const videoPromises = contentData.topics.map(async (topicObj) => {
    const videos = await getYoutubeVideos(topicObj.topic);
    console.log(`✓ Found ${videos.length} videos for: ${topicObj.topic}`);
    return {
      ...topicObj,
      videos: videos
    };
  });

  const topicsWithVideos = await Promise.all(videoPromises);
  contentData.topics = topicsWithVideos;

  return contentData;
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      courseName,
      courseDescription,
      category,
      level,
      chapters, // Array of chapters: [{ chapterName, topics }, ...]
      includeVideo = true,
      bannerImageUrl = ''
    } = body;

    // Validate required fields
    if (!courseName || !chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', details: 'courseName and chapters array are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', details: 'Please sign in to generate content' },
        { status: 401 }
      );
    }

    const user = await currentUser();
    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { success: false, error: 'User email not found', details: 'Unable to retrieve user email' },
        { status: 400 }
      );
    }
    const userEmail = user.emailAddresses[0].emailAddress;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error', details: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Generate content for all chapters
    console.log(`Generating content for ${chapters.length} chapters...`);
    const allChaptersContent = [];

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      console.log(`\nProcessing Chapter ${i + 1}/${chapters.length}: ${chapter.chapterName}`);
      
      const chapterContent = await generateChapterContent(
        chapter.chapterName,
        chapter.topics
      );
      
      allChaptersContent.push(chapterContent);
      
      // Add delay between chapters to avoid rate limits
      if (i < chapters.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Create the complete course content structure
    const courseContent = {
      courseName,
      courseDescription,
      category,
      level,
      totalChapters: chapters.length,
      chapters: allChaptersContent
    };

    // Generate unique course ID
    const courseId = `course_${userId}_${Date.now()}`;

    // Save to database
    console.log('\nSaving complete course to database...');
    const [savedCourse] = await db.insert(courseTable).values({
      cid: courseId,
      name: courseName,
      description: courseDescription || `Course about ${courseName}`,
      chapter: chapters.length,
      includevideo: includeVideo,
      category: category || 'General',
      level: level || 'Beginner',
      courseJson: courseContent, // Legacy field
      coursecontent: courseContent, // New field with all chapters
      userEmail: userEmail,
      bannerImageurl: bannerImageUrl,
    }).returning();

    console.log('✓ Course saved successfully with ID:', savedCourse.id);

    const totalVideos = allChaptersContent.reduce((acc, chapter) => 
      acc + chapter.topics.reduce((sum, t) => sum + (t.videos?.length || 0), 0), 0
    );

    return NextResponse.json({
      success: true,
      message: 'Course content generated and saved successfully',
      data: courseContent,
      course: {
        id: savedCourse.id,
        cid: savedCourse.cid,
        name: savedCourse.name,
        totalChapters: chapters.length,
        createdAt: savedCourse.createdAt
      },
      generatedAt: new Date().toISOString(),
      videosFound: totalVideos
    });

  } catch (error) {
    console.error('API Error:', error);
    
    if (error.code === '23503') {
      return NextResponse.json({
        success: false,
        error: 'User not found in database',
        details: 'Please ensure your user profile is created'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to generate content',
      details: error.message,
      type: error.name
    }, { status: 500 });
  }
}