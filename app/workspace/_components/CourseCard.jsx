import axios from "axios";
import { LoaderCircle, PlayCircleIcon, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const CourseCard = ({ course }) => {
  const {
    name,
    description,
    chapter,
    bannerImageurl,
    coursecontent,
    cid,
  } = course;

  const [loading, setLoading] = useState(false);

  const onEnrollCourse = async () => {
    try {
      setLoading(true);

      const res = await axios.post("/api/enroll-course", {
        courseId: cid, // Changed to match API route
      });

      alert("Successfully enrolled in the course");
      console.log(res.data);
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message || "Failed to enroll course"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group w-full max-w-sm rounded-2xl border bg-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col">
      
      {/* Image */}
      <div className="relative w-full h-48 flex-shrink-0">
        {bannerImageurl && (
          <>
            <Image
              src={bannerImageurl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        
        {/* Top content wrapper */}
        <div className="flex flex-col gap-3 flex-1">
          {/* Meta */}
          <span className="w-fit text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
            {chapter} Chapters
          </span>

          {/* Title */}
          <h2 className="text-lg font-semibold leading-snug line-clamp-2">
            {name}
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-3">
            {description}
          </p>
        </div>

        {/* CTA */}
        {coursecontent ? (
          <button
            onClick={onEnrollCourse}
            disabled={loading}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-full text-sm font-medium text-white bg-black hover:bg-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <LoaderCircle className="w-5 h-5 animate-spin" />
            ) : (
              <PlayCircleIcon className="w-5 h-5" />
            )}
            Enroll Course
          </button>
        ) : (
          <Link
            href={`/workspace/edit-course/${cid}`}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-full text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 transition"
          >
            <Settings className="w-5 h-5" />
            Generate Content
          </Link>
        )}
      </div>
    </div>
  );
};

export default CourseCard;