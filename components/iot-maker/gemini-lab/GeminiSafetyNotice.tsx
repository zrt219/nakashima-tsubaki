type Props = {
  selectedPreset: string;
  mode?: "mock" | "gemini";
};

export function GeminiSafetyNotice({ selectedPreset, mode = "mock" }: Props) {
  return (
    <div className="mt-3 rounded border border-cyan-900/30 bg-black/25 p-2 text-xs">
      <p className="font-semibold uppercase tracking-[0.16em] text-cyan-300">Safety notice</p>
      <p className="mt-2 text-command-muted">Active preset: {selectedPreset}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-200">
        <li>Gemini can only propose advisory actions.</li>
        <li>Operator approval is required before any command is dispatched.</li>
        <li>Prompt and proposal metadata is logged; secrets are never logged.</li>
        <li>Telemetry remains off-chain; only evidence hashes are anchored.</li>
        <li>Current mode: {mode === "mock" ? "DEMO MODE / local fallback" : "CONNECTED TEST MODE"}.</li>
      </ul>
    </div>
  );
}

