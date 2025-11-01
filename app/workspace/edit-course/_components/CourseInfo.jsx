import { Button } from '@/components/ui/button';
import { BookAIcon, BookOpenCheck, ClockAlert, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

function CourseInfo({ course }) {
  const courseLayout = course?.courseJson?.course;
  const bannerUrl = course?.bannerImageurl;

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
              <h2>10 Hours</h2>
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
              <h2>Beginner</h2>
            </section>
          </div>
        </div>

        <Button className="max-w-sm">
          <BookOpenCheck /> Generate Content
        </Button>
      </div>

{bannerUrl ? (
  <Image
    src={bannerUrl}  // ← Change this from bannerImageurl to bannerUrl
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
