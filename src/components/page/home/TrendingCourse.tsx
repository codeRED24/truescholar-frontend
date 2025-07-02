import { HomeCourse } from '@/api/@types/home-datatype';
import Link from 'next/link'
import React from 'react'

interface TrendingCourseProps {
    data: HomeCourse[];
}

const TrendingCourse: React.FC<TrendingCourseProps> = ({ data }) => {
    return (
        <div className='bg-[#141A21] container-body pb-6 md:pb-12'>
            <div className="flex justify-between items-center py-6">
                <h2 className="font-bold lg:text-5xl font-public text-[#919EAB]">
                    Trending <span className="text-white">Courses</span>
                </h2>
                <Link href="/" className="text-primary-main font-semibold">View All</Link>
            </div>
            <div className='flex flex-wrap gap-4 overflow-x-auto h-36'>
                {data.map((course) => (
                    <div key={course.course_id} className='p-2 md:p-4 bg-white rounded-full min-w-20 md:min-w-40 text-center'>
                        <h3>{course.short_name}</h3>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TrendingCourse