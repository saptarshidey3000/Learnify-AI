"use client"
import { Button } from '@/components/ui/button';
import { BookAIcon, BookOpenCheck, ClockAlert, TrendingUp, Loader2, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import axios from 'axios';

function CourseInfo({ course }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [generatedChapters, setGeneratedChapters] = useState([]);
  
  const courseLayout = course?.courseJson?.course;
  const bannerUrl = course?.bannerImageurl;

  // ─────────────────────────────────────────────────────────────
  // 🚀 Generate Content for All Chapters
  // ─────────────────────────────────────────────────────────────
  const handleGenerateContent = async () => {
    try {
      setLoading(true);
      setGeneratedChapters([]);
      console.log('🎯 Starting content generation...');
      
      const chapters = courseLayout?.chapters;
      
      if (!chapters || chapters.length === 0) {
        alert('No chapters found in course');
        return;
      }

      setProgress({ current: 0, total: chapters.length });
      console.log(`📚 Generating content for ${chapters.length} chapters...`);

      // Prepare chapters data for batch generation
      const chaptersData = chapters.map(chapter => ({
        chapterName: chapter.chapterName,
        topics: chapter.topics
      }));

      // Call the updated API with all chapters at once
      const result = await axios.post('/api/generate-content', {
        courseName: courseLayout?.name,
        courseDescription: courseLayout?.description,
        category: courseLayout?.category || 'General',
        level: courseLayout?.level || 'Beginner',
        includeVideo: course?.includevideo ?? true,
        bannerImageUrl: bannerUrl || '',
        chapters: chaptersData
      });

      if (result.data.success) {
        console.log('✅ All chapters generated successfully!');
        setProgress({ current: chapters.length, total: chapters.length });
        setGeneratedChapters(result.data.data.chapters.map(ch => ch.chapterName));
        
        alert(`🎉 Successfully generated content for all ${chapters.length} chapters!\n\nCourse ID: ${result.data.course.cid}\nTotal Videos: ${result.data.videosFound}`);
      } else {
        throw new Error(result.data.error || 'Generation failed');
      }

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

  // ─────────────────────────────────────────────────────────────
  // 🎨 Progress Display Component
  // ─────────────────────────────────────────────────────────────
  const ProgressDisplay = () => {
    if (!loading && progress.current === 0) return null;
    
    const percentage = progress.total > 0 
      ? Math.round((progress.current / progress.total) * 100) 
      : 0;

    return (
      <div className="flex flex-col gap-2 mt-3">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Counter and Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">
            {loading ? 'Generating...' : 'Completed!'} {progress.current} / {progress.total} chapters
          </span>
          <span className="text-blue-600 font-bold">{percentage}%</span>
        </div>

        {/* Generated Chapters List */}
        {generatedChapters.length > 0 && (
          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {generatedChapters.map((chapterName, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{chapterName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 p-4 md:p-5 rounded-2xl shadow-2xl">
      {/* Left Section - Course Info */}
      <div className="flex flex-col gap-3 flex-1">
        <h2 className="font-bold text-2xl md:text-3xl">{courseLayout?.name}</h2>
        <p className="text-sm md:text-base line-clamp-2 text-gray-700">{courseLayout?.description}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <div className="flex gap-3 items-center p-3 rounded-lg shadow-md">
            <ClockAlert className="text-blue-600 w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
            <section>
              <h2 className="font-bold text-sm md:text-base">Duration</h2>
              <h2 className="text-xs md:text-sm text-gray-600">{courseLayout?.duration || '10 Hours'}</h2>
            </section>
          </div>

          <div className="flex gap-3 items-center p-3 rounded-lg shadow-md">
            <BookAIcon className="text-green-600 w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
            <section>
              <h2 className="font-bold text-sm md:text-base">Chapters</h2>
              <h2 className="text-xs md:text-sm text-gray-600">{course?.chapter}</h2>
            </section>
          </div>

          <div className="flex gap-3 items-center p-3 rounded-lg shadow-md sm:col-span-2 lg:col-span-1">
            <TrendingUp className="text-green-600 w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
            <section>
              <h2 className="font-bold text-sm md:text-base">Difficulty Level</h2>
              <h2 className="text-xs md:text-sm text-gray-600">{courseLayout?.level || 'Beginner'}</h2>
            </section>
          </div>
        </div>

        {/* Generate Button with Progress */}
        <div className="w-full">
          <Button 
            className="w-full md:max-w-sm gap-2" 
            onClick={handleGenerateContent}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                <span className="text-sm md:text-base">Generating Content...</span>
              </>
            ) : progress.current > 0 ? (
              <>
                <CheckCircle2 className="text-green-400 w-4 h-4" />
                <span className="text-sm md:text-base">Content Generated</span>
              </>
            ) : (
              <>
                <BookOpenCheck className="w-4 h-4" />
                <span className="text-sm md:text-base">Generate Content</span>
              </>
            )}
          </Button>

          {/* Progress Display */}
          <ProgressDisplay />
        </div>
      </div>

      {/* Right Section - Banner Image */}
      <div className="w-full lg:w-[400px] flex-shrink-0">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt="Course Banner"
            width={400}
            height={240}
            className="w-full h-48 md:h-60 rounded-2xl object-cover"
            priority
          />
        ) : (
          <div className="w-full h-48 md:h-60 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-500 text-sm md:text-base">
            No banner available
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseInfo;