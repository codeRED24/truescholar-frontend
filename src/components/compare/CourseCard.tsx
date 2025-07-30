import React from "react";

function CourseCard({ course }: { course: any }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="grid gap-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Course Name</span>
          <span className="font-semibold text-gray-800 ">
            {course.name || (
              <span className="italic text-gray-400">Course</span>
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Level</span>
          <span className="font-semibold text-gray-800">
            {course.level || "-"}
          </span>
        </div>{" "}
        <div className="flex justify-between">
          <span className="text-gray-500">Course Type</span>
          <span className="font-semibold text-gray-800">
            {course.degree_type || "-"}
          </span>
        </div>{" "}
        <div className="flex justify-between">
          <span className="text-gray-500">Duration</span>
          <span className="font-semibold text-gray-800">
            {course.duration ? course.duration + course.duration_type : "-"}
          </span>
        </div>{" "}
        <div className="flex justify-between">
          <span className="text-gray-500">Eligibility</span>
          <span className="font-semibold text-gray-800">
            {course.eligibility || "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Mode</span>
          <span className="font-semibold text-gray-800">
            {course.is_online || "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Course Format</span>
          <span className="font-semibold text-gray-800">
            {course.course_format || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
