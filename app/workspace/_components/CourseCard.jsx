import { PlayCircleIcon, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CourseCard = ({ course }) => {
  const {
    name,
    description,
    chapter,
    bannerImageurl,
    coursecontent
  } = course;

  return (
    <div className="group w-full max-w-sm rounded-2xl border bg-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">

      {/* Image Section */}
      <div className="relative w-full h-48">
        {bannerImageurl && (
          <>
            <Image
              src={bannerImageurl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover"
            />
            {/* subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3">

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

        {/* CTA */}
        <button
          className={`mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition ${
            coursecontent
              ? "bg-black hover:bg-gray-900"
              : "bg-purple-700 hover:bg-purple-800"
          }`}
        >
{coursecontent ? (
  <button className="mt-auto h-11 flex items-center justify-center gap-2 rounded-full text-sm font-medium text-white bg-black hover:bg-gray-900 transition">
    <PlayCircleIcon className="w-5 h-5" />
    Start Learning
  </button>
) : (
  <Link
    href={`/workspace/edit-course/${course?.cid}`}
    className="mt-auto h-11 flex items-center justify-center gap-2 rounded-full text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 transition"
  >
    <Settings className="w-5 h-5" />
    Generate Content
  </Link>
)}


        </button>
      </div>
    </div>
  );
};

export default CourseCard;
