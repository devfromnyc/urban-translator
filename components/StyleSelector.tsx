type StyleSelectorProps = {
  styles: string[];
  selectedStyle: string;
  onChange: (style: string) => void;
};

export function StyleSelector({
  styles,
  selectedStyle,
  onChange,
}: StyleSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-3">
      {styles.map((style) => {
        const isActive = style === selectedStyle;

        return (
          <button
            type="button"
            key={style}
            onClick={() => onChange(style)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              isActive
                ? "border-blue-400 bg-blue-500/20 text-blue-200 shadow-[0_0_18px_-6px_rgba(96,165,250,0.9)]"
                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
            }`}
            aria-pressed={isActive}
          >
            {style}
          </button>
        );
      })}
    </div>
  );
}
