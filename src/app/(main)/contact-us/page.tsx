"use server";

import { CourseDTO } from "@/api/@types/course-type";
import { getCourses } from "@/api/list/getCourses";
import ContactForm from "@/components/forms/ContactForm";
export default async function Contact() {
  let courses: CourseDTO[] = await getCourses();

  return <ContactForm courseData={courses} />;
}
