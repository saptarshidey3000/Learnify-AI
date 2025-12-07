import React from 'react'
import { Gift } from 'lucide-react'

function ChapterTopicList({ course }) {
  const courseLayout = course?.courseJson?.course

  return (
    <div>
      <h2 className='font-bold text-3xl mt-10'>Chapters and Topics</h2>

      <div className="flex flex-col items-center justify-center mt-10">

        {/* CHAPTERS LOOP */}
        {courseLayout?.chapters.map((chapter, index) => (
          <div key={index} className="flex flex-col items-center">

            <div className="p-4 border shadow rounded-xl bg-primary text-white">
              <h2 className="text-center">Chapter {index + 1}</h2>
              <h2 className="font-bold text-lg text-center">{chapter.chapterName}</h2>
              <h2 className="text-xs flex justify-between gap-16">
                <span>Duration: {chapter?.duration}</span>
                <span>No. Of Topics: {chapter?.topics?.length}</span>
              </h2>
            </div>

            {/* TOPICS LOOP */}
            <div>
              {chapter?.topics.map((topic, i) => (
                <div className="flex flex-col items-center" key={i}>
                  <div className="h-10 bg-gray-300 w-1"></div>

                  <div className="flex items-center gap-5">
                    <span className={`max-w-xs ${i % 2 === 0 ? 'text-transparent' : ''}`}>
                      {topic}
                    </span>

                    <h2 className="text-center rounded-full bg-gray-300 px-6 text-gray-500 p-4">
                      {i + 1}
                    </h2>

                    <span className={`max-w-xs ${i % 2 !== 0 ? 'text-transparent' : ''}`}>
                      {topic}
                    </span>
                  </div>

                  {/* LAST TOPIC MARKER */}
                  {i === chapter?.topics?.length - 1 && (
                    <>
                      <div className="h-10 bg-gray-300 w-1"></div>
                      <div className="flex items-center gap-5">
                        <Gift className="text-center rounded-full bg-gray-300 h-14 w-14 text-gray-500 p-4" />
                      </div>
                      <div className="h-10 bg-gray-300 w-1"></div>
                    </>
                  )}
                </div>
              ))}
            </div>

          </div>
        ))}

        {/* ✅ MOVE FINISH CARD HERE – OUTSIDE THE LOOP */}
        <div className="p-4 border shadow rounded-xl bg-green-600 text-white mt-10">
          <h2>Finish</h2>
        </div>

      </div>
    </div>
  )
}

export default ChapterTopicList
