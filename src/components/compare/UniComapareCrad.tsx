export default function UniComapareCrad({ uni }: { uni: any }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="grid gap-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Established In</span>
          <span className="font-semibold text-gray-800 line-clamp-1">
            {uni.data?.college?.college_name || "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Established In</span>
          <span className="font-semibold text-gray-800">
            {uni.data?.college?.founded_year || "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Type of Instution</span>
          <span className="font-semibold text-gray-800">
            {uni.data?.college?.type_of_institute || "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total Courses</span>
          <span className="font-semibold text-gray-800">
            {uni.data?.college?.CollegesCourses?.length ?? "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total Students</span>
          <span className="font-semibold text-gray-800">
            {uni.data?.college?.total_student ?? "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Acceptance Rate</span>
          <span className="font-semibold text-gray-800">
            {uni.data?.college?.campus_size ?? "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
