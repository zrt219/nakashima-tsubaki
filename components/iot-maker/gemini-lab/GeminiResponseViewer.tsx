"use client";

type Result = {
  mode: "mock" | "gemini";
  model: string;
  promptPreset: string;
  responseText: string;
  confidence: number;
  safetyClassification: "advisory_only" | "tool_call_proposed" | "unclassified";
  approvalRequired: boolean;
  createdAt: string;
  usedPreset: string;
  durationMs: number;
};

type Props = {
  result: Result;
};

export function GeminiResponseViewer({ result }: Props) {
  return (
    <div className="mt-3 space-y-2 border border-cyan-500/20 bg-black/30 p-3 text-xs">
      <p className="font-semibold uppercase tracking-[0.16em] text-cyan-200">Response</p>
      <div className="grid gap-2 md:grid-cols-2">
        <p>
          <span className="text-command-muted">Model:</span> {result.model}
        </p>
        <p>
          <span className="text-command-muted">Mode:</span> {result.mode}
        </p>
        <p>
          <span className="text-command-muted">Preset:</span> {result.usedPreset}
        </p>
        <p>
          <span className="text-command-muted">Safety:</span> {result.safetyClassification}
        </p>
        <p>
          <span className="text-command-muted">Approval required:</span> {String(result.approvalRequired)}
        </p>
        <p>
          <span className="text-command-muted">Latency:</span> {result.durationMs}ms
        </p>
        <p>
          <span className="text-command-muted">Confidence:</span>{" "}
          {Number.isFinite(result.confidence) ? `${Math.round(result.confidence * 100)}%` : "n/a"}
        </p>
        <p>
          <span className="text-command-muted">Generated:</span> {result.createdAt}
        </p>
      </div>
      <p className="whitespace-pre-wrap rounded border border-command-line/40 bg-black/35 p-3 text-slate-200">
        {result.responseText}
      </p>
    </div>
  );
}

