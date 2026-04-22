type ContextInputProps = {
  value: string;
  onChange: (value: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
};

export function ContextInput({
  value,
  onChange,
  isExpanded,
  onToggle,
}: ContextInputProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left text-sm font-medium text-zinc-200 transition hover:text-zinc-100"
        aria-expanded={isExpanded}
      >
        <span>Add context (optional)</span>
        <span
          className={`text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          v
        </span>
      </button>

      {isExpanded ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Example: Make it about cooking and keep it under 2 sentences."
          className="mt-3 min-h-24 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-blue-400 focus:shadow-[0_0_0_1px_rgba(96,165,250,0.5),0_0_18px_-8px_rgba(59,130,246,0.8)]"
        />
      ) : null}
    </section>
  );
}
