"use client"
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import EnrollCourseCard from './EnrollCourseCard'

function EnrollCourseList() {

    const [enrolledCourseList, setEnrolledCourseList] = useState([])
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        GetEnrolledCourse();
    }, [])

    const GetEnrolledCourse = async () => {
        try {
            setLoading(true)
            const result = await axios.get('/api/enroll-course');
            console.log("API Response:", result.data);
            console.log("First item structure:", result.data[0]);
            setEnrolledCourseList(result.data);
        } catch (error) {
            console.error("Error fetching enrolled courses:", error);
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className='mt-3'>
                <h2 className='font-bold text-3xl mb-6'>
                    Continue Learning Experience
                </h2>
                <p className='text-gray-500'>Loading your courses...</p>
            </div>
        )
    }

    if (!enrolledCourseList || enrolledCourseList.length === 0) {
        return (
            <div className='mt-3'>
                <h2 className='font-bold text-3xl mb-6'>
                    Continue Learning Experience
                </h2>
                <p className='text-gray-500'>No enrolled courses yet.</p>
            </div>
        )
    }

    return (
        <div>
            <div className='mt-3'>
                <h2 className='font-bold text-3xl mb-6'>
                    Continue Learning Experience
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {enrolledCourseList.map((item, index) => {
                        console.log(`Course ${index}:`, item);
                        // The API returns objects with 'courses' property from the join
                        return <EnrollCourseCard key={item.enrollCourse?.id || index} course={item.courses} />
                    })}
                </div>
            </div>
        </div>
    )
}

export default EnrollCourseList