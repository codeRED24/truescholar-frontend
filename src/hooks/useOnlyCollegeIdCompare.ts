"use client";

import { useState, useEffect } from "react";
// import axios from "axios";

export const useOnlyCollegeIdCompare = (collegeId: string | null) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [college, setCollege] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collegeId) {
      setCourses([]);
      return;
    }

    const fetchStreams = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/compare?college_id=${collegeId}`,
          { next: { revalidate: 10800 } }
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setCollege(data.data);
          setCourses(data.data?.college?.CollegesCourses || []);
        } else {
          setError("Failed to fetch Courses");
        }
      } catch (err) {
        setError("An error occurred while fetching Courses");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, [collegeId]);

  return { college, courses, loading, error };
};
