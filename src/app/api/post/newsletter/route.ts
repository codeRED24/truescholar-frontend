import { NextResponse } from "next/server";

type NewsletterData = {
  name: string;
  mobile_no: string;
  email: string;
  response_url: string;
  location: object;
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

  const newsletterData: NewsletterData = await request.json();

  const response = await fetch(`${API_URL}/newsletter`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newsletterData),
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