import { NextRequest, NextResponse } from "next/server";

type LeadFormData = {
  name: string;
  email: string;
  mobile_no: string;
  course_group_id: number;
  college_id: number;
  city_id: number;
  response_url: string;
  location: string;
  preferred_city: number;
  not_sure: boolean;
};

export async function POST(request: NextRequest) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

  if (!API_URL || !BEARER_TOKEN) {
    return NextResponse.json(
      { error: "API URL or Bearer token is missing from environment variables." },
      { status: 400 }
    );
  }

  let leadData: LeadFormData;
  try {
    leadData = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const response = await fetch(`${API_URL}/lead-form`, {
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

    const nextResponse = NextResponse.json(data, { status: 200 });

    nextResponse.cookies.set("leadFormSubmitted", JSON.stringify(leadData), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "strict",
    });

    return nextResponse;
  } catch {
    return NextResponse.json(
      { error: "Failed to parse response as JSON." },
      { status: 500 }
    );
  }
}