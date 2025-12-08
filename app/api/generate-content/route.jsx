import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const PROMPT = `Generate detailed content for each topic in the course chapter.
CRITICAL: Return ONLY valid JSON with no line breaks in content strings.

Return exactly this JSON structure:
{
  "chapterName": "string",
  "topics": [
    {
      "topic": "string",
      "content": "string (HTML formatted, use <br> instead of newlines)"
    }
  ]
}

IMPORTANT RULES:
1. NO line breaks (\\n) inside content strings - use <br> tags instead
2. Content should be 200-300 words per topic
3. Use HTML: <h3>, <p>, <ul>, <li>, <strong>, <em>, <br>
4. Keep all JSON on single lines (no pretty printing)
5. Escape all quotes inside content with \\"

User Input:`;

export async function POST(req) {
  console.log('🚀 Content generation API initiated');
  
  try {
    // ─────────────────────────────────────────────────────────────
    // 📥 STEP 1: Parse incoming request
    // ─────────────────────────────────────────────────────────────
    const { chapterName, topics } = await req.json();
    console.log('✅ Request data received:', { chapterName, topicsCount: topics?.length });
    
    if (!chapterName || !topics || topics.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          details: 'chapterName and topics array are required'
        }, 
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 🔐 STEP 2: Authenticate user
    // ─────────────────────────────────────────────────────────────
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ Authentication failed');
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          details: 'Please sign in to generate content'
        }, 
        { status: 401 }
      );
    }
    console.log('✅ User authenticated:', userId);

    // ─────────────────────────────────────────────────────────────
    // 🔑 STEP 3: Verify API key
    // ─────────────────────────────────────────────────────────────
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found');
      return NextResponse.json({ 
        success: false,
        error: 'Server configuration error',
        details: 'AI service not configured'
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
    // 📝 STEP 5: Prepare input data
    // ─────────────────────────────────────────────────────────────
    const inputData = {
      chapterName,
      topics: topics.map(t => typeof t === 'string' ? t : t.topic || t)
    };
    
    console.log('📤 Generating content for:', inputData);

    // ─────────────────────────────────────────────────────────────
    // 🚀 STEP 6: Generate content with Gemini (with retry logic)
    // ─────────────────────────────────────────────────────────────
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
              parts: [
                {
                  text: PROMPT + JSON.stringify(inputData, null, 2),
                },
              ],
            },
          ],
        });
        break; // Success, exit loop
      } catch (error) {
        if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
          retries--;
          if (retries > 0) {
            const waitTime = (4 - retries) * 5000; // 5s, 10s, 15s
            console.log(`⏳ Rate limited. Waiting ${waitTime/1000}s before retry... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            throw new Error('Rate limit exceeded. Please wait a few minutes and try again.');
          }
        } else {
          throw error; // Different error, throw immediately
        }
      }
    }
    
    console.log('✅ AI response received');

    // ─────────────────────────────────────────────────────────────
    // 📄 STEP 7: Extract text from response
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
      throw new Error('Unable to extract text from AI response');
    }

    console.log('📄 Extracted text length:', fullText.length, 'characters');

    // ─────────────────────────────────────────────────────────────
    // 🧹 STEP 8: Advanced JSON cleaning
    // ─────────────────────────────────────────────────────────────
    let contentData;
    try {
      // Remove markdown code blocks
      let cleanedText = fullText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Try to extract JSON if there's extra text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      // First attempt: parse as-is
      try {
        contentData = JSON.parse(cleanedText);
        console.log('✅ JSON parsed successfully (direct parse)');
      } catch (firstError) {
        console.log('⚠️ Direct parse failed, attempting to fix newlines...');
        
        // Second attempt: Fix escaped newlines inside strings
        // This regex finds content between quotes and replaces \n with <br>
        cleanedText = cleanedText.replace(
          /"content":\s*"([^"]*(?:\\.[^"]*)*)"/g,
          (match, content) => {
            const fixed = content
              .replace(/\\n/g, '<br>')
              .replace(/\n/g, '<br>')
              .replace(/\\r/g, '');
            return `"content": "${fixed}"`;
          }
        );
        
        contentData = JSON.parse(cleanedText);
        console.log('✅ JSON parsed successfully (after newline fix)');
      }
      
      console.log('📚 Generated content for:', contentData.chapterName);
      console.log('📝 Topics generated:', contentData.topics?.length);
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      console.log('Raw response preview:', fullText.substring(0, 1000));
      console.log('...', fullText.substring(fullText.length - 500));
      
      // Try one last time with a more aggressive approach
      try {
        console.log('🔧 Attempting aggressive JSON repair...');
        
        // Extract just the structure we need
        const topicsMatch = fullText.match(/"topics":\s*\[([\s\S]*)\]/);
        const chapterMatch = fullText.match(/"chapterName":\s*"([^"]*)"/);
        
        if (topicsMatch && chapterMatch) {
          // Reconstruct manually
          contentData = {
            chapterName: chapterMatch[1],
            topics: []
          };
          
          // Parse topics more carefully
          const topicsContent = topicsMatch[1];
          const topicBlocks = topicsContent.split(/},\s*{/);
          
          topicBlocks.forEach((block, idx) => {
            const topicNameMatch = block.match(/"topic":\s*"([^"]*)"/);
            const contentMatch = block.match(/"content":\s*"([\s\S]*?)"\s*$/);
            
            if (topicNameMatch && contentMatch) {
              contentData.topics.push({
                topic: topicNameMatch[1],
                content: contentMatch[1]
                  .replace(/\\n/g, '<br>')
                  .replace(/\n/g, '<br>')
                  .replace(/\\"/g, '"')
              });
            }
          });
          
          console.log('✅ JSON reconstructed successfully');
        } else {
          throw new Error('Could not extract required fields');
        }
      } catch (repairError) {
        return NextResponse.json({ 
          success: false,
          error: 'AI generated invalid JSON format',
          details: parseError.message,
          rawResponse: fullText.substring(0, 2000)
        }, { status: 200 });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // ✅ STEP 9: Return successful response
    // ─────────────────────────────────────────────────────────────
    console.log('🎉 Content generation successful');
    
    return NextResponse.json({ 
      success: true,
      message: 'Content generated successfully',
      data: contentData,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Fatal error in content generation:');
    // console.error('Type:', error.name);
    // console.error('Message:', error.message);
    // console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false,
        // error: 'Failed to generate content',
        // details: error.message,
        // type: error.name
      }, 
      { status: 500 }
    );
  }
}