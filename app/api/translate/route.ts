import { NextRequest, NextResponse } from "next/server";
import { translateWithGemini } from "@/lib/gemini";

type TranslateBody = {
  text?: string;
  style?: string;
  context?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TranslateBody;
    const text = body.text?.trim();
    const style = body.style?.trim();
    const context = body.context?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required." },
        { status: 400 },
      );
    }

    if (!style) {
      return NextResponse.json(
        { error: "Style is required." },
        { status: 400 },
      );
    }

    const result = await translateWithGemini({
      text,
      style,
      context: context || undefined,
    });

    return NextResponse.json({ result });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while translating.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
