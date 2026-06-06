"use client";

type Preset = { id: string; label: string };

type Props = {
  presets: Preset[];
  selectedPreset: string;
  onSelect: (preset: string) => void;
};

export function SupabaseQueryPresetList({ presets, selectedPreset, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Read-only presets</p>
      <div className="grid gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset.id)}
            className={`border px-2 py-2 text-left text-xs uppercase tracking-[0.1em] ${
              preset.id === selectedPreset
                ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-100"
                : "border-command-line bg-black/30 text-slate-300 hover:border-cyan-400/30"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
