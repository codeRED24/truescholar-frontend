import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

if (!API_URL || !BEARER_TOKEN) {
  throw new Error('API URL or Bearer token is missing from environment variables.');
}

export const getNewsByCollegeId = async (collegeId: number) => {
  try {
    const response = await fetch(`${API_URL}/college-info/college-wise-news/${collegeId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return notFound();
    }

    const data = await response.json();
    return data;
  } catch {
    return notFound();
  }
};