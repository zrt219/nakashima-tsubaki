type Preset = {
  id: string;
  label: string;
};

type Props = {
  presets: Preset[];
  selectedPreset: string;
  onSelect: (presetId: string) => void;
};

export function GeminiPresetList({ presets, selectedPreset, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.16em] text-command-muted">Presets</p>
      <div className="space-y-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset.id)}
            className={`w-full border px-3 py-2 text-left text-xs uppercase tracking-[0.14em] ${
              selectedPreset === preset.id
                ? "border-cyan-400/60 bg-cyan-400/12 text-cyan-100"
                : "border-command-line/50 bg-black/25 text-slate-300 hover:border-cyan-300/40"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

