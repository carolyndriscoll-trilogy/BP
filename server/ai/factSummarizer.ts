import { callOpenRouterModel } from './llm-utils';

const SYSTEM_PROMPT = "You are a concise fact summarizer. Summarize the provided text into a maximum of 3 lines. Be direct and clear. Do not use any markdown (no bold, no italics, no bullet points), no formatting, and NO emojis. Provide only the plain text summary.";

export async function summarizeFact(fullText: string): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    return fullText.substring(0, 200) + "...";
  }

  // Primary: Gemini 2.0 Flash
  try {
    return await callOpenRouterModel(
      'google/gemini-2.0-flash-001',
      SYSTEM_PROMPT,
      `Summarize this fact:\n\n${fullText}`,
      150,
      0.3
    );
  } catch (error) {
    console.error("Gemini summarization failed, trying Qwen fallback:", error);
  }

  // Fallback: Qwen
  try {
    return await callOpenRouterModel(
      'qwen/qwen3-32b',
      SYSTEM_PROMPT,
      `Summarize this fact:\n\n${fullText}`,
      150,
      0.3
    );
  } catch (error) {
    console.error("Qwen summarization also failed:", error);
    return fullText.substring(0, 200) + "...";
  }
}
