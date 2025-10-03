import { createOpenRouter } from '@openrouter/ai-sdk-provider';
const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error("Missing OPENROUTER_API_KEY environment variable for OpenRouter provider");
}

export const openrouter = createOpenRouter({
  apiKey,
  headers: {
    // So OpenRouter displays referrer and app name. Can be used for attribution/rate-limits
    "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
    "X-Title": "Candidate",
  },
});

export const MODEL_ID = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash-preview-09-2025";
