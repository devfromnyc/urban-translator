type TextPanelProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder: string;
};

export function TextPanel({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
}: TextPanelProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-200">{label}</h2>
        <span className="text-xs text-zinc-400">
          {value.length}/{maxLength}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className="min-h-64 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-blue-400 focus:shadow-[0_0_0_1px_rgba(96,165,250,0.5),0_0_22px_-8px_rgba(59,130,246,0.8)]"
      />
    </section>
  );
}
