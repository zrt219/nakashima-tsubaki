"use client";

type ToolCall = {
  name: string;
  args: Record<string, unknown>;
};

type Props = {
  toolCall: ToolCall;
};

export function GeminiToolCallViewer({ toolCall }: Props) {
  return (
    <div className="mt-2 border border-amber-400/35 bg-amber-400/10 p-3 text-xs">
      <p className="font-semibold uppercase tracking-[0.16em] text-amber-100">Proposed tool call</p>
      <p className="mt-2 text-cyan-200">Tool: {toolCall.name}</p>
      <pre className="mt-2 overflow-auto border border-amber-300/30 bg-black/35 p-2 text-[11px] text-slate-100">
        {JSON.stringify(toolCall.args, null, 2)}
      </pre>
      <p className="mt-2 text-amber-100">
        Operator review required before any action enters command flow.
      </p>
    </div>
  );
}

