"use client";

import { useState } from "react";
import { ContextInput } from "@/components/ContextInput";
import { OutputPanel } from "@/components/OutputPanel";
import { StyleSelector } from "@/components/StyleSelector";
import { TextPanel } from "@/components/TextPanel";

const STYLES = [
  "Donald Trump",
  "Shakespeare",
  "Yoda",
  "Gordon Ramsay",
  "A Pirate",
  "Elon Musk",
  "Valley Girl",
  "Formal Academic",
];

const MAX_INPUT_LENGTH = 500;

export default function Home() {
  const [style, setStyle] = useState(STYLES[0]);
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) {
      return;
    }

    setError("");
    setIsLoading(true);
    setResult("");
    setCopied(false);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          style,
          context: context.trim() || undefined,
        }),
      });

      const data: { result?: string; error?: string } = await response.json();

      if (!response.ok || !data.result) {
        throw new Error(data.error || "Translation failed. Please try again.");
      }

      setResult(data.result);
    } catch (translateError) {
      setError(
        translateError instanceof Error
          ? translateError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-[0_0_60px_-20px_rgba(59,130,246,0.28)] backdrop-blur sm:p-6">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Urban Translator
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-400 sm:text-base">
          Translate everyday text into iconic voices with Gemini.
        </p>

        <div className="mt-6">
          <StyleSelector styles={STYLES} selectedStyle={style} onChange={setStyle} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <TextPanel
            label="Original Text"
            value={text}
            onChange={setText}
            maxLength={MAX_INPUT_LENGTH}
            placeholder="Enter text to translate..."
          />
          <OutputPanel
            label="Translated Output"
            output={result}
            isLoading={isLoading}
            onCopy={handleCopy}
            copied={copied}
          />
        </div>

        <div className="mt-4">
          <ContextInput
            value={context}
            onChange={setContext}
            isExpanded={isContextExpanded}
            onToggle={() => setIsContextExpanded((previous) => !previous)}
          />
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleTranslate}
            disabled={!text.trim() || isLoading}
            className="inline-flex min-w-40 items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {isLoading ? "Translating..." : "Translate"}
          </button>
        </div>
      </div>
    </main>
  );
}
