import { NextResponse } from "next/server";

type LeadFormData = {
  contact_us_id: number;
  created_at: string;
  updated_at: string;
  email: string;
  mobile_no: string;
  query: string;
  response_url: string;
  location: string;
  course_group_id: number | null;
  course_group: string | null;
};

export async function POST(request: Request) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

  if (!API_URL || !BEARER_TOKEN) {
    return NextResponse.json(
      {
        error: "API URL or Bearer token is missing from environment variables.",
      },
      { status: 400 }
    );
  }

  const leadData: LeadFormData = await request.json();

  const response = await fetch(`${API_URL}/contact-us`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(leadData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || "Unknown error occurred";
    return NextResponse.json(
      {
        error: `Error: ${response.status} ${response.statusText} - ${errorMessage}`,
      },
      { status: response.status }
    );
  }

  try {
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse response as JSON." },
      { status: 500 }
    );
  }
}