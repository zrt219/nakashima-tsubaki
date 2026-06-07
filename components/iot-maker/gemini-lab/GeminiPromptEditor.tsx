"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  showCustomPrompt: boolean;
  customPrompt: string;
  readOnly: boolean;
  isRunning: boolean;
};

export function GeminiPromptEditor({
  value,
  onChange,
  showCustomPrompt,
  customPrompt,
  readOnly,
  isRunning,
}: Props) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.16em] text-command-muted">
        Prompt input
      </label>
      {showCustomPrompt ? (
        <textarea
          value={customPrompt}
          onChange={(event) => onChange(event.target.value)}
          disabled={isRunning}
          rows={6}
          className="w-full border border-command-line bg-black/20 p-2 text-xs text-slate-100"
          placeholder="Describe what you want the advisory model to analyze."
        />
      ) : (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={isRunning || readOnly}
          rows={6}
          className="w-full border border-command-line bg-black/20 p-2 text-xs text-slate-100"
          readOnly={readOnly}
        />
      )}
    </div>
  );
}

