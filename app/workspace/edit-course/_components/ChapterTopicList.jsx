import React from 'react'
import { Gift } from 'lucide-react'

function ChapterTopicList({ course }) {
  // ✅ Try both data structures - coursecontent (generated) or courseJson (layout only)
  const courseLayout = course?.coursecontent || course?.courseJson?.course;
  
  console.log('ChapterTopicList - course:', course);
  console.log('ChapterTopicList - courseLayout:', courseLayout);
  console.log('ChapterTopicList - chapters:', courseLayout?.chapters);

  // ✅ Show message if no chapters
  if (!courseLayout?.chapters || courseLayout.chapters.length === 0) {
    return (
      <div className="mt-10 p-6 text-center border-2 border-dashed rounded-xl">
        <p className="text-gray-500">No chapters available yet.</p>
        <p className="text-sm text-gray-400 mt-2">Click "Generate Content" to create course content.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className='font-bold text-3xl mt-10'>Chapters and Topics</h2>

      <div className="flex flex-col items-center justify-center mt-10">

        {/* CHAPTERS LOOP */}
        {courseLayout.chapters.map((chapter, index) => (
          <div key={index} className="flex flex-col items-center">

            <div className="p-4 border shadow rounded-xl bg-primary text-white min-w-[300px]">
              <h2 className="text-center">Chapter {index + 1}</h2>
              <h2 className="font-bold text-lg text-center">{chapter.chapterName}</h2>
              <h2 className="text-xs flex justify-between gap-16">
                <span>Duration: {chapter?.duration || 'N/A'}</span>
                <span>No. Of Topics: {chapter?.topics?.length || 0}</span>
              </h2>
            </div>

            {/* TOPICS LOOP */}
            <div>
              {chapter?.topics && Array.isArray(chapter.topics) && chapter.topics.map((topic, i) => {
                // ✅ Handle both string topics and object topics
                const topicName = typeof topic === 'string' ? topic : (topic.topic || topic.name || 'Unnamed Topic');
                
                return (
                  <div className="flex flex-col items-center" key={i}>
                    <div className="h-10 bg-gray-300 w-1"></div>

                    <div className="flex items-center gap-5">
                      <span className={`max-w-xs text-sm ${i % 2 === 0 ? 'text-transparent' : ''}`}>
                        {topicName}
                      </span>

                      <h2 className="text-center rounded-full bg-gray-300 px-6 text-gray-500 p-4 min-w-[50px]">
                        {i + 1}
                      </h2>

                      <span className={`max-w-xs text-sm ${i % 2 !== 0 ? 'text-transparent' : ''}`}>
                        {topicName}
                      </span>
                    </div>

                    {/* LAST TOPIC MARKER */}
                    {i === chapter.topics.length - 1 && (
                      <>
                        <div className="h-10 bg-gray-300 w-1"></div>
                        <div className="flex items-center gap-5">
                          <Gift className="text-center rounded-full bg-gray-300 h-14 w-14 text-gray-500 p-4" />
                        </div>
                        <div className="h-10 bg-gray-300 w-1"></div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        ))}

        {/* ✅ FINISH CARD - OUTSIDE THE LOOP */}
        <div className="p-4 border shadow rounded-xl bg-green-600 text-white">
          <h2 className="font-semibold">Finish</h2>
        </div>

      </div>
    </div>
  )
}

export default ChapterTopicList