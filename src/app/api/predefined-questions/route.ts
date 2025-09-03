import { cardConfig } from "@/lib/ai-questions";
import { gateway } from "@ai-sdk/gateway";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

async function generateAllQuestions() {
  const topics = Object.keys(cardConfig).join(", ");
  const prompt = `Generate 3 unique, interesting, and specific predefined questions for a chatbot for each sub-topic.
The main topics are: "${topics}".
For each main topic, generate questions for the following sub-topics:
${Object.entries(cardConfig)
  .map(([topic, { subTabs }]) => `- ${topic}: ${subTabs.join(", ")}`)
  .join("\n")}

The questions should be around 10 words and highly relevant to an Indian student seeking information about higher education. The questions should cover a diverse range of aspects within each subtopic.

Format the output as a single JSON object. The keys of the object should be the main topics. The value for each main topic should be another object where keys are the sub-topics and values are an array of 3 question strings.

Example format:
{
  "Colleges": {
    "All": ["Question 1?", "Question 2?", "Question 3?"],
    "Admissions": ["Question 1?", "Question 2?", "Question 3?"]
  },
  "Exams": {
    "All": ["Question 1?", "Question 2?", "Question 3?"],
    "Syllabus": ["Question 1?", "Question 2?", "Question 3?"]
  }
}

Do not include any other text or markdown formatting in your response. Just the JSON object.`;

  const { text } = await generateText({
    model: gateway("google/gemini-2.5-flash"),
    prompt,
  });
  return text;
}

export async function GET(request: NextRequest) {
  try {
    const rawResponse = await generateAllQuestions();
    // Clean the response by removing markdown code block fences
    const cleanedResponse = rawResponse.replace(/```json\n|```/g, "").trim();
    const jsonResponse = JSON.parse(cleanedResponse);

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
