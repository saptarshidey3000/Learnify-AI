"use client"
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import CourseInfo from '../../edit-course/_components/CourseInfo';
import ChapterTopicList from '../../edit-course/_components/ChapterTopicList';

function ViewCourse() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    const GetCourseInfo = async () => {
      try {
        setLoading(true);
        const result = await axios.get(`/api/courses?courseId=${courseId}`);
        console.log('View Course - Course data:', result.data);
        setCourse(result.data);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    GetCourseInfo();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-10">
        <p className="text-center text-gray-500">Course not found</p>
      </div>
    );
  }

  return (
    <div>
      <CourseInfo course={course} />
      <ChapterTopicList course={course} />
    </div>
  );
}

export default ViewCourse;