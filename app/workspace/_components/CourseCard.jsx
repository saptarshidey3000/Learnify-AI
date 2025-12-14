import Image from 'next/image';

const CourseCard = ({ course }) => {
  const courseData = course?.courseJson?.course || course;

  const {
    bannerImageurl,
    name,
    description,
    chapter
  } = courseData || {};

  return (
    <div className="w-full max-w-sm h-[420px] rounded-xl border bg-white flex flex-col overflow-hidden">

      {/* Image */}
      <div className="relative w-full h-40 bg-gray-100">
        {bannerImageurl && (
          <Image
            src={bannerImageurl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-cover"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h2 className="font-semibold line-clamp-2">{name}</h2>
        <p className="text-sm text-gray-500">{chapter || 0} Chapters</p>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
          {description}
        </p>

        <button className="mt-auto bg-black text-white py-2 rounded-lg">
          Start Learning
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
