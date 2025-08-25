import { load } from "cheerio";

/**
 * Parses HTML content to extract FAQ questions and answers using Cheerio
 * @param htmlContent The HTML string containing FAQ data
 * @returns Array of FAQ objects with question and answer
 */
export const parseFAQFromHTML = (
  htmlContent: string
): Array<{ question: string; answer: string }> => {
  const faqs: Array<{ question: string; answer: string }> = [];

  try {
    const $ = load(htmlContent);

    $("details.faq-item").each((index, element) => {
      const $detail = $(element);
      const question = $detail.find("summary.faq-ques").text().trim();
      const answer = $detail.find("p.faq-ans").text().trim();

      if (question && answer) {
        faqs.push({
          question,
          answer,
        });
      }
    });
  } catch (error) {
    console.error("Error parsing FAQ HTML:", error);
  }

  return faqs;
};
