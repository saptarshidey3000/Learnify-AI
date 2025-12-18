import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";

function EnrollCourseCard({ course }) {
  console.log("EnrollCourseCard received:", course);
  
  if (!course) {
    console.log("No course data provided");
    return null;
  }

  const {
    name,
    description,
    chapter,
    bannerImageurl,
    cid,
  } = course;

  return (
    <div className="group w-full rounded-2xl border bg-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col">
      
      {/* Image */}
      <div className="relative w-full h-48 flex-shrink-0">
        {bannerImageurl ? (
          <>
            <Image
              src={bannerImageurl}
              alt={name || "Course"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-white/50" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        
        {/* Top content wrapper */}
        <div className="flex flex-col gap-3 flex-1">
          {/* Meta */}
          <div className="flex items-center gap-2">
            <span className="w-fit text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
              Enrolled
            </span>
            {chapter && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {chapter} Chapters
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold leading-snug line-clamp-2">
            {name || "Untitled Course"}
          </h2>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {description}
            </p>
          )}
        </div>

        {/* CTA - Continue Learning */}
        <Link
          href={`/workspace/course/${cid}`}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition"
        >
          <BookOpen className="w-5 h-5" />
          Continue Learning
        </Link>
      </div>
    </div>
  );
}

export default EnrollCourseCard;