import { HomeExam } from '@/api/@types/home-datatype';
import HomeExamCard from '@/components/cards/HomeExamCard';
import Link from 'next/link';
import React from 'react'

interface UpcomingExamsProps {
    data: HomeExam[];
}

const Exams: React.FC<UpcomingExamsProps> = ({ data }) => {
    return (
        <div className="container-body pb-6 md:pb-12">
            <div className="flex justify-between items-center py-6">
                <h2 className="font-bold lg:text-5xl font-public">
                    Upcoming <span className="text-[#919EAB]">Exams</span>
                </h2>
                <Link href="/exams" className="text-primary-main font-semibold">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.slice(0, 6).map((exam) => (
                    <div key={exam.exam_id}>
                        <HomeExamCard exam={exam} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Exams