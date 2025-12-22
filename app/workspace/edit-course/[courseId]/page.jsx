"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import CourseInfo from "../_components/CourseInfo";
import ChapterTopicList from "../_components/ChapterTopicList";

function EditCourse() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    const GetCourseInfo = async () => {
      try {
        setLoading(true);
        const result = await axios.get(
          `/api/courses?courseId=${courseId}`
        );
        setCourse(result.data);
      } finally {
        setLoading(false);
      }
    };

    GetCourseInfo();
  }, [courseId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <CourseInfo course={course} />
      <ChapterTopicList course={course} />
    </div>
  );
}

export default EditCourse;
