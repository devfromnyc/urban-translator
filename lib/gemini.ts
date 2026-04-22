type GeminiTranslateInput = {
  text: string;
  style: string;
  context?: string;
};

type GeminiApiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function translateWithGemini({
  text,
  style,
  context,
}: GeminiTranslateInput) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const prompt = [
    `You are ${style}. Rewrite the following text exactly as ${style} would say it. Keep the same general meaning but fully adopt the voice, vocabulary, and mannerisms of ${style}. Return only the rewritten text, no explanations.`,
    "",
    `Text: ${text}`,
    context ? `Additional instructions: ${context}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  );

  const data = (await response.json()) as GeminiApiResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini API request failed.");
  }

  const result = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!result) {
    throw new Error("Gemini did not return a translated response.");
  }

  return result;
}
