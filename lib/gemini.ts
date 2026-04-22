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

type GeminiModelsResponse = {
  models?: Array<{
    name?: string;
    supportedGenerationMethods?: string[];
  }>;
};

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-2.5-flash";
const PREFERRED_FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

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

function normalizeModelName(modelName: string) {
  return modelName.replace(/^models\//, "").trim();
}

function buildGenerateContentUrl(apiKey: string, model: string) {
  return `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`;
}

function extractTranslatedText(data: GeminiApiResponse) {
  return data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();
}

function shouldRetryWithDifferentModel(status: number, message?: string) {
  const normalizedMessage = (message || "").toLowerCase();

  return (
    (status === 404 &&
      /not found|not supported for generatecontent/i.test(normalizedMessage)) ||
    (status === 429 &&
      /quota exceeded/.test(normalizedMessage) &&
      /limit:\s*0/.test(normalizedMessage))
  );
}

async function callGeminiGenerateContent(
  apiKey: string,
  model: string,
  prompt: string,
) {
  const response = await fetch(buildGenerateContentUrl(apiKey, model), {
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
  });

  const data = (await response.json()) as GeminiApiResponse;
  return { response, data };
}

async function discoverGenerateContentModels(apiKey: string) {
  const response = await fetch(`${GEMINI_API_BASE}/models?key=${apiKey}`);

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as GeminiModelsResponse;

  return (data.models || [])
    .filter((model) =>
      (model.supportedGenerationMethods || []).includes("generateContent"),
    )
    .map((model) => normalizeModelName(model.name || ""))
    .filter(Boolean);
}

export async function translateWithGemini({
  text,
  style,
  context,
}: GeminiTranslateInput) {
  const apiKey = process.env.GEMINI_API_KEY;
  const configuredModel = normalizeModelName(
    process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL,
  );

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

  const firstAttempt = await callGeminiGenerateContent(
    apiKey,
    configuredModel,
    prompt,
  );

  if (firstAttempt.response.ok) {
    const result = extractTranslatedText(firstAttempt.data);

    if (!result) {
      throw new GeminiApiError("Gemini did not return a translated response.", 502);
    }

    return result;
  }

  if (
    shouldRetryWithDifferentModel(
      firstAttempt.response.status,
      firstAttempt.data.error?.message,
    )
  ) {
    const discoveredModels = await discoverGenerateContentModels(apiKey);
    const fallbackCandidates = [
      ...PREFERRED_FALLBACK_MODELS,
      ...discoveredModels,
    ].map(normalizeModelName);
    const fallbackModel = fallbackCandidates.find(
      (model) => model && model !== configuredModel,
    );

    if (fallbackModel) {
      const fallbackAttempt = await callGeminiGenerateContent(
        apiKey,
        fallbackModel,
        prompt,
      );

      if (fallbackAttempt.response.ok) {
        const fallbackResult = extractTranslatedText(fallbackAttempt.data);

        if (!fallbackResult) {
          throw new GeminiApiError(
            "Gemini did not return a translated response.",
            502,
          );
        }

        return fallbackResult;
      }

      throw new GeminiApiError(
        getGeminiErrorMessage(
          fallbackAttempt.response.status,
          fallbackAttempt.data.error?.message,
        ),
        fallbackAttempt.response.status,
      );
    }
  }

  throw new GeminiApiError(
    getGeminiErrorMessage(
      firstAttempt.response.status,
      firstAttempt.data.error?.message,
    ),
    firstAttempt.response.status,
  );
}
