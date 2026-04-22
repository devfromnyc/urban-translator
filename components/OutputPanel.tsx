type OutputPanelProps = {
  label: string;
  output: string;
  isLoading: boolean;
  onCopy: () => void;
  copied: boolean;
};

export function OutputPanel({
  label,
  output,
  isLoading,
  onCopy,
  copied,
}: OutputPanelProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-200">{label}</h2>
        <button
          type="button"
          onClick={onCopy}
          disabled={!output}
          className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="min-h-64 rounded-lg border border-zinc-700 bg-zinc-950 p-3">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-500 border-t-blue-400" />
          </div>
        ) : output ? (
          <p className="fade-in-up whitespace-pre-wrap text-sm text-zinc-100">
            {output}
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            Translation will appear here.
          </p>
        )}
      </div>
    </section>
  );
}
