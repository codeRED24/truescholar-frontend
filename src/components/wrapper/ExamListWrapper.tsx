import dynamic from "next/dynamic";

const ExamsList = dynamic(() => import("../page/exam/ExamList"));

export default function ExamListWrapper() {
  return <ExamsList />;
}
