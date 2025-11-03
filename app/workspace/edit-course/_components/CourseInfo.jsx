"use client"
import { Button } from '@/components/ui/button';
import { BookAIcon, BookOpenCheck, ClockAlert, TrendingUp, Loader2 } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import axios from 'axios';

function CourseInfo({ course }) {
  const [loading, setLoading] = useState(false);
  const courseLayout = course?.courseJson?.course;
  const bannerUrl = course?.bannerImageurl;

  // ─────────────────────────────────────────────────────────────
  // 🚀 Generate Content for All Chapters
  // ─────────────────────────────────────────────────────────────
  const handleGenerateContent = async () => {
    try {
      setLoading(true);
      console.log('🎯 Starting content generation...');
      
      const chapters = courseLayout?.chapters;
      
      if (!chapters || chapters.length === 0) {
        alert('No chapters found in course');
        return;
      }

      console.log(`📚 Generating content for ${chapters.length} chapters...`);

      // Generate content for each chapter
      const generatedContent = [];
      
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        console.log(`\n📖 Processing Chapter ${i + 1}/${chapters.length}: ${chapter.chapterName}`);
        
        try {
          const result = await axios.post('/api/generate-content', {
            chapterName: chapter.chapterName,
            topics: chapter.topics
          });

          if (result.data.success) {
            console.log(`✅ Chapter ${i + 1} content generated successfully`);
            generatedContent.push(result.data);
          } else {
            console.error(`⚠️ Chapter ${i + 1} generation failed:`, result.data);
            generatedContent.push({ 
              error: true, 
              chapter: chapter.chapterName,
              details: result.data.error 
            });
          }

        } catch (chapterError) {
          console.error(`❌ Error on Chapter ${i + 1}:`, chapterError.message);
          generatedContent.push({ 
            error: true, 
            chapter: chapter.chapterName,
            details: chapterError.response?.data?.details || chapterError.message 
          });
          
          // If rate limited, wait longer before continuing
          if (chapterError.message?.includes('429') || chapterError.message?.includes('rate')) {
            console.log('🛑 Rate limit hit, waiting 30 seconds...');
            await new Promise(resolve => setTimeout(resolve, 30000));
          }
        }

        // Longer delay between requests to avoid rate limiting
        if (i < chapters.length - 1) {
          const delay = 3000; // 3 seconds between chapters
          console.log(`⏳ Waiting ${delay/1000}s before next chapter...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      console.log('\n🎉 All content generated successfully!');
      console.log('📦 Complete generated content:', generatedContent);
      
      alert(`Successfully generated content for ${generatedContent.length} chapters!`);

    } catch (error) {
      console.error('💥 Error generating content:');
      console.error('Message:', error.message);
      console.error('Response:', error.response?.data);
      
      const errorMessage = error.response?.data?.details || error.message || 'Unknown error';
      alert(`Failed to generate content: ${errorMessage}`);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-5 justify-between p-5 rounded-2xl shadow-2xl">
      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-3xl">{courseLayout?.name}</h2>
        <p className="line-clamp-2">{courseLayout?.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-5 items-center p-3 rounded-lg shadow-xl">
            <ClockAlert className="text-blue-600" />
            <section>
              <h2 className="font-bold">Duration</h2>
              <h2>{courseLayout?.duration || '10 Hours'}</h2>
            </section>
          </div>

          <div className="flex gap-5 items-center p-3 rounded-lg shadow-xl">
            <BookAIcon className="text-green-600" />
            <section>
              <h2 className="font-bold">Chapters</h2>
              <h2>{course?.chapter}</h2>
            </section>
          </div>

          <div className="flex gap-5 items-center p-3 rounded-lg shadow-xl">
            <TrendingUp className="text-green-600" />
            <section>
              <h2 className="font-bold">Difficulty Level</h2>
              <h2>{courseLayout?.level || 'Beginner'}</h2>
            </section>
          </div>
        </div>

        <Button 
          className="max-w-sm" 
          onClick={handleGenerateContent}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <BookOpenCheck /> Generate Content
            </>
          )}
        </Button>
      </div>

      {bannerUrl ? (
        <Image
          src={bannerUrl}
          alt="Banner Image"
          width={400}
          height={400}
          className="w-full h-60 rounded-2xl object-cover"
        />
      ) : (
        <div className="w-[400px] h-60 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-500">
          No banner available
        </div>
      )}
    </div>
  );
}

export default CourseInfo;