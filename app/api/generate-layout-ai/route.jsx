import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/config/db'; // Your database instance
import { courseTable } from '@/config/schema'; // Your schema

// 🎯 AI Prompt Template
// This instructs the AI on what kind of course structure to generate
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
    "category": "Main category",
    "level": "Beginner/Intermediate/Expert",
    "includevideo": true,
    "chapter": 5,
    "bannerImagePrompt": "A modern, flat-style 2D illustration showing [relevant visual elements]. Use vibrant colors and clean design.",
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

// 📡 POST API Handler
// This function handles course generation requests from the frontend
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
    const user = await currentUser(); // Get full user details including email
    
    // Block unauthorized requests
    if (!userId) {
      console.log('❌ Authentication failed - no user ID');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Please sign in to generate courses' }, 
        { status: 401 }
      );
    }
    
    // Get user email (required for database foreign key)
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      console.log('❌ No email found for user');
      return NextResponse.json(
        { error: 'User email not found', details: 'Please ensure your email is verified' }, 
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
    const model = 'gemini-2.0-flash-exp'; // Fast, efficient model
    
    console.log('⚡ Sending request to Gemini AI...');
    const result = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              // Combine prompt template with user's form data
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
    // The response structure can vary, so we try multiple approaches
    let fullText = '';
    
    if (result.response && typeof result.response.text === 'function') {
      // Standard method - response.text() is a function
      fullText = result.response.text();
    } else if (result.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      // Fallback - extract from nested structure
      fullText = result.response.candidates[0].content.parts[0].text;
    } else if (result.text && typeof result.text === 'function') {
      // Alternative - result.text() is a function
      fullText = result.text();
    } else if (typeof result.text === 'string') {
      // Direct string response
      fullText = result.text;
    } else {
      // Unable to extract text - log full response for debugging
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
      // Remove markdown code block syntax if present
      // AI sometimes wraps JSON in ```json ... ```
      const cleanedText = fullText
        .replace(/```json\n?/g, '')  // Remove opening ```json
        .replace(/```\n?/g, '')       // Remove closing ```
        .trim();                       // Remove extra whitespace
      
      // Parse the cleaned JSON string into an object
      courseData = JSON.parse(cleanedText);
      console.log('✅ JSON parsed successfully');
      console.log('📚 Generated course:', courseData.course?.name);
    } catch (parseError) {
      // JSON parsing failed - return raw response for debugging
      console.error('❌ JSON parsing failed:', parseError.message);
      console.log('Raw AI response:', fullText.substring(0, 500) + '...');
      
      return NextResponse.json({ 
        success: false,
        course: null,
        rawResponse: fullText,
        error: 'AI generated invalid JSON format',
        details: parseError.message
      }, { status: 200 }); // Still 200 since API worked, just data format issue
    }

    // ─────────────────────────────────────────────────────────────
    // 🆔 STEP 8: Generate unique course ID
    // ─────────────────────────────────────────────────────────────
    const courseId = uuidv4(); // Generate UUID for cid field
    console.log('🆔 Generated course ID:', courseId);

    // ─────────────────────────────────────────────────────────────
    // 💾 STEP 9: Save course to database
    // ─────────────────────────────────────────────────────────────
    let dbResult;
    try {
      // Extract course data (handle both nested and direct formats)
      const course = courseData.course || courseData;
      
      // Prepare database record matching your schema
      const dbRecord = {
        cid: courseId,                                              // UUID (varchar)
        name: course.name || formData.name,                         // Course name (varchar)
        description: course.description || formData.description,    // Description (varchar)
        chapter: formData.chapter,                                  // Number of chapters (integer)
        includevideo: formData.includevideo,                        // Include video (boolean)
        category: Array.isArray(formData.category) 
          ? formData.category.join(', ')                            // Convert array to string
          : formData.category,                                      // Category (varchar)
        level: formData.level,                                      // Difficulty level (varchar)
        courseJson: courseData,                                     // Full course JSON (json)
        userEmail: userEmail,                                       // User email (foreign key)
      };
      
      console.log('💾 Saving to database...');
      dbResult = await db.insert(courseTable).values(dbRecord).returning();
      
      console.log('✅ Course saved to database');
      console.log('📊 Database record:', dbResult[0]);
      
    } catch (dbError) {
      // Database save failed - log error and return it to user
      console.error('💥 Database save failed:', dbError.message);
      console.error('Error details:', dbError);
      
      return NextResponse.json({ 
        success: false,
        error: 'Failed to save course to database',
        details: dbError.message,
        course: courseData, // Still return generated course
      }, { status: 500 });
    }

    // ─────────────────────────────────────────────────────────────
    // ✅ STEP 10: Return successful response to frontend
    // ─────────────────────────────────────────────────────────────
    console.log('🎉 Course generation and save successful');
    return NextResponse.json({ 
      success: true, 
      message: 'Course generated and saved successfully',
      course: courseData.course || courseData,
      courseId: courseId,                    // UUID for reference
      dbRecord: dbResult[0],                 // Database record with auto-generated ID
      userId: userId,
      userEmail: userEmail,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    // ─────────────────────────────────────────────────────────────
    // ❌ ERROR HANDLER: Catch any unexpected errors
    // ─────────────────────────────────────────────────────────────
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