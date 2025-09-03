import { cardConfig } from "@/lib/ai-questions";
import ChatbotWidget from "./ChatbotWidget";

export async function generateAllQuestions() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/predefined-questions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to fetch predefined questions:", error);
    return {};
  }
}

export default async function ChatbotContainer() {
  const questions = await generateAllQuestions();
  return <ChatbotWidget questions={questions} cardConfig={cardConfig} />;
}
