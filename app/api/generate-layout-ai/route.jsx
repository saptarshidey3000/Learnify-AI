import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { db } from '@/config/db';
import { courseTable } from '@/config/schema';
import { duration } from 'drizzle-orm/gel-core';

const PROMPT = `Generate a comprehensive Learning Course based on the user's input.

Requirements:
- Create a detailed course structure with proper chapters and topics
- Include a creative banner image prompt for visual representation
- Ensure all durations are realistic and appropriate for the content
- Make topics specific, actionable, and well-organized

Return ONLY valid JSON in this exact format (no additional text or markdown):

{
  "course": {
    "name": "Course Title",
    "description": "Detailed course description",
    "duration" : "duration of the course"
    "category": "Main category",
    "level": "Beginner/Intermediate/Expert",
    "includevideo": true,
    "chapter": 5,
    "bannerImagePrompt": "Create a modern, flat-style 2D digital illustration for a course banner titled \"{course.name}\". Use a clean, vibrant, and professional design with smooth gradients, geometric shapes, and minimalist icons. Include stylish typography displaying the course name prominently. Visually represent the course topic using relevant elements, tools, or symbols (e.g., books, computers, charts, UI screens, abstract learning icons, etc.). Maintain a balanced composition with bright colors (blues, purples, oranges, or teals), subtle shadows, and a modern tech aesthetic. The final artwork should look like a premium educational platform banner, suitable for websites or dashboards.",
    "chapters": [
      {
        "chapterName": "Chapter Title",
        "duration": "2 hours",
        "topics": ["Topic 1", "Topic 2", "Topic 3"]
      }
    ]
  }
}

User Input:
`;

export const ai2 = new GoogleGenAI({
  apiKey:process.env.GEMINI_API_KEY,
})

export async function POST(req) {
  console.log('🚀 API route initiated');
  
  try {
    // ─────────────────────────────────────────────────────────────
    // 📥 STEP 1: Parse incoming request data
    // ─────────────────────────────────────────────────────────────
    const formData = await req.json();
    console.log('✅ Request data received:', formData);
    
    // ─────────────────────────────────────────────────────────────
    // 🔐 STEP 2: Authenticate user with Clerk
    // ─────────────────────────────────────────────────────────────
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      console.log('❌ Authentication failed - no user ID');
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized', 
          details: 'Please sign in to generate courses' 
        }, 
        { status: 401 }
      );
    }
    
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      console.log('❌ No email found for user');
      return NextResponse.json(
        { 
          success: false,
          error: 'User email not found', 
          details: 'Please ensure your email is verified' 
        }, 
        { status: 400 }
      );
    }
    
    console.log('✅ User authenticated:', userId);
    console.log('📧 User email:', userEmail);

    // ─────────────────────────────────────────────────────────────
    // 🔑 STEP 3: Verify Gemini API key exists
    // ─────────────────────────────────────────────────────────────
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment');
      return NextResponse.json({ 
        success: false,
        error: 'Server configuration error',
        details: 'AI service is not properly configured'
      }, { status: 500 });
    }
    console.log('✅ API key verified');

    // ─────────────────────────────────────────────────────────────
    // 🤖 STEP 4: Initialize Google Generative AI
    // ─────────────────────────────────────────────────────────────
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    console.log('✅ Gemini AI initialized');

    // ─────────────────────────────────────────────────────────────
    // 📤 STEP 5: Prepare and send request to Gemini
    // ─────────────────────────────────────────────────────────────
    // const model = 'gemini-2.0-flash-exp';
    const model = 'gemini-2.5-flash';
    
    console.log('⚡ Sending request to Gemini AI...');
    const result = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: PROMPT + JSON.stringify(formData, null, 2),
            },
          ],
        },
      ],
    });
    console.log('✅ AI response received');

    // ─────────────────────────────────────────────────────────────
    // 📝 STEP 6: Extract text from AI response
    // ─────────────────────────────────────────────────────────────
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
      console.error('❌ Unexpected response structure');
      console.log('Response:', JSON.stringify(result, null, 2));
      throw new Error('Unable to extract text from AI response');
    }

    console.log('📄 Extracted text length:', fullText.length, 'characters');

    // ─────────────────────────────────────────────────────────────
    // 🧹 STEP 7: Clean and parse JSON response
    // ─────────────────────────────────────────────────────────────
    let courseData;
    try {
      const cleanedText = fullText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      courseData = JSON.parse(cleanedText);
      console.log('✅ JSON parsed successfully');
      console.log('📚 Generated course:', courseData.course?.name);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      console.log('Raw AI response:', fullText.substring(0, 500) + '...');
      
      return NextResponse.json({ 
        success: false,
        course: null,
        rawResponse: fullText,
        error: 'AI generated invalid JSON format',
        details: parseError.message
      }, { status: 200 });
    }

    // ─────────────────────────────────────────────────────────────
    // 🖼️ STEP 7.5: Handle banner image (AI or Custom)
    // ─────────────────────────────────────────────────────────────
    let bannerImageurl = null;
    
    // 🆕 Check if user wants custom URL
    if (formData.bannerImageOption === 'custom') {
      console.log('🔗 Using custom banner URL');
      bannerImageurl = formData.customBannerUrl;
      
      // 🆕 Validate URL format
      try {
        new URL(bannerImageurl);
        console.log('✅ Custom URL validated:', bannerImageurl);
      } catch (urlError) {
        console.warn('⚠️ Invalid URL format:', bannerImageurl);
        // Continue anyway, database will store whatever is provided
      }
    } 
    // 🆕 Generate with AI if option is 'ai' or not specified
    else {
      try {
        const imagePrompt = courseData.course?.bannerImagePrompt;
        
        if (imagePrompt) {
          console.log('🎨 Generating banner image with AI...');
          bannerImageurl = await GenerateImage(imagePrompt);
          console.log('✅ Banner image generated');
        } else {
          console.log('⚠️ No banner image prompt found');
        }
      } catch (imageError) {
        console.error('⚠️ Image generation failed:', imageError.message);
        // Continue without the image
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 🆔 STEP 8: Generate unique course ID
    // ─────────────────────────────────────────────────────────────
    const courseId = uuidv4();
    console.log('🆔 Generated course ID:', courseId);

    // ─────────────────────────────────────────────────────────────
    // 💾 STEP 9: Save course to database
    // ─────────────────────────────────────────────────────────────
    let dbResult;
    try {
      const course = courseData.course || courseData;
      
      const dbRecord = {
        cid: courseId,
        name: course.name || formData.name,
        description: course.description || formData.description,
        // duration: course.duration || formData.duration,
        chapter: formData.chapter,
        includevideo: formData.includevideo,
        category: Array.isArray(formData.category) 
          ? formData.category.join(', ')
          : formData.category,
        level: formData.level,
        courseJson: courseData,
        userEmail: userEmail,
        bannerImageurl: bannerImageurl || '' // 🆕 Will be either AI-generated or custom URL
      };
      
      console.log('💾 Saving to database...');
      dbResult = await db.insert(courseTable).values(dbRecord).returning();
      
      console.log('✅ Course saved to database');
      
    } catch (dbError) {
      console.error('💥 Database save failed:', dbError.message);
      
      return NextResponse.json({ 
        success: false,
        error: 'Failed to save course to database',
        details: dbError.message,
        course: courseData,
      }, { status: 500 });
    }

    // ─────────────────────────────────────────────────────────────
    // ✅ STEP 10: Return successful response
    // ─────────────────────────────────────────────────────────────
    console.log('🎉 Course generation and save successful');
    return NextResponse.json({ 
      success: true, 
      message: 'Course generated and saved successfully',
      course: courseData.course || courseData,
      courseId: courseId,
      dbRecord: dbResult[0],
      userId: userId,
      userEmail: userEmail,
      bannerImageurl: bannerImageurl,
      bannerImageSource: formData.bannerImageOption || 'ai', // 🆕 Track source
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Fatal error in course generation:');
    console.error('Type:', error.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate course',
        details: error.message,
        type: error.name
      }, 
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// 🖼️ Image Generation Function
// ─────────────────────────────────────────────────────────────
const GenerateImage = async (imagePrompt) => {
  try {
    const BASE_URL = 'https://aigurulab.tech';
    
    const result = await axios.post(
      BASE_URL + '/api/generate-image',
      {
        width: 1024,
        height: 1024,
        input: imagePrompt,
        model: 'flux',
        aspectRatio: "16:9"
      },
      {
        headers: {
          'x-api-key': process.env.AI_IMAGE_API,
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );
    
    console.log('✅ Image generated successfully');
    return result.data.image;
    
  } catch (error) {
    console.error('❌ Image generation error:', error.message);
    throw error;
  }
};