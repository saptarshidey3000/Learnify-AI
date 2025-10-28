"use client"
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react'

function CourseList() {
    const [courseList, setCourseList] =useState([]);
  return (
    <div className='mt-5'>
        <h2 className='font-bold text-3xl p-4'>Course List</h2>
        {courseList?.length==0?<div className='flex p-7 items-center justify-center flex-col border rounded-2xl shadow-2xl'>
<img 
  src="https://i.pinimg.com/736x/b9/c8/5b/b9c85b6d8556c763df38dc0ff3dde1d9.jpg" 
  alt="edu" 
  width="150" 
  height="150"
  className="rounded-lg"
/>
            <h2 className='my-2 text-lg font-bold'>Look Like you haven't created any course yet</h2>
            <Button><PlusCircle/>Create your First Course</Button>
        </div> :
        <div>
            List of Courses
        </div>}
    </div>
  )
}

export default CourseList