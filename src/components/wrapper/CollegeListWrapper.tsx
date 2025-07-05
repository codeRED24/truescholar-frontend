import dynamic from "next/dynamic";

const CollegeList = dynamic(() => import("../page/college/CollegeList"));

export default function ExamListWrapper() {
  return <CollegeList />;
}
