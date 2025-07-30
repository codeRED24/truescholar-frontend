"use client";

import { useState, useEffect } from "react";
// import axios from "axios";

export type CollegeCourseCompareResult = {
  college: any; // You can type this more strictly if you know the shape
};

export const useCollegeCourseCompare = (
  collegeId: string | null,
  courseId: string | null
) => {
  const [data, setData] = useState<CollegeCourseCompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collegeId || !courseId) {
      setData(null);
      return;
    }

    const fetchComparison = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/compare?college_id=${collegeId}&course_id=${courseId}`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setData(data.data);
        } else {
          setError("Failed to fetch comparison");
        }
      } catch (err) {
        setError("An error occurred while fetching comparison");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [collegeId, courseId]);

  return { data, loading, error };
};
