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

export class GeminiApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GeminiApiError";
    this.status = status;
  }
}

function getGeminiErrorMessage(status: number, apiMessage?: string) {
  if (status === 403) {
    return (
      apiMessage ||
      "Gemini rejected the request (403). Check that your API key is valid and has permission to use this model."
    );
  }

  if (status === 429) {
    return (
      apiMessage ||
      "Gemini quota is exceeded (429). Check your usage limits, billing plan, or try a lower-cost model."
    );
  }

  return apiMessage || `Gemini API request failed with status ${status}.`;
}

export async function translateWithGemini({
  text,
  style,
  context,
}: GeminiTranslateInput) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash";

  if (!apiKey) {
    throw new GeminiApiError("Missing GEMINI_API_KEY environment variable.", 500);
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
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
    throw new GeminiApiError(
      getGeminiErrorMessage(response.status, data.error?.message),
      response.status,
    );
  }

  const result = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!result) {
    throw new GeminiApiError("Gemini did not return a translated response.", 502);
  }

  return result;
}
