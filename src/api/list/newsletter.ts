import { NewsletterData } from "@/types/newsletter";

export async function submitNewsletter(data: NewsletterData) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/newsletter`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Newsletter signup failed.");
  return result;
}
