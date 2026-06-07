"use client";

import { useState } from "react";
import { addLogEvent } from "@/lib/dashboard-logs/logStore";
import { Panel } from "@/components/tn-command-center/command-center-primitives";
import { GeminiPromptEditor } from "@/components/iot-maker/gemini-lab/GeminiPromptEditor";
import { GeminiPresetList } from "@/components/iot-maker/gemini-lab/GeminiPresetList";
import { GeminiResponseViewer } from "@/components/iot-maker/gemini-lab/GeminiResponseViewer";
import { GeminiToolCallViewer } from "@/components/iot-maker/gemini-lab/GeminiToolCallViewer";
import { GeminiSafetyNotice } from "@/components/iot-maker/gemini-lab/GeminiSafetyNotice";

type GeminiPreset = {
  id: string;
  label: string;
  prompt: string;
};

type GeminiToolCall = {
  name: string;
  args: Record<string, unknown>;
};

type GeminiResult = {
  mode: "mock" | "gemini";
  model: string;
  promptPreset: string;
  responseText: string;
  confidence: number;
  safetyClassification: "advisory_only" | "tool_call_proposed" | "unclassified";
  approvalRequired: boolean;
  createdAt: string;
  toolCall?: GeminiToolCall;
  usedPreset: string;
  durationMs: number;
};

const PRESETS: GeminiPreset[] = [
  {
    id: "summarize_shift",
    label: "Summarize Shift",
    prompt: "Summarize the current simulated plant shift from telemetry and event ledger."
  },
  {
    id: "explain_thermal_drift",
    label: "Explain Thermal Drift",
    prompt: "Explain why thermal drift matters and what evidence should be reviewed."
  },
  {
    id: "recommend_safe_action",
    label: "Recommend Safe Action",
    prompt: "Recommend safe advisory-only next steps for a thermal drift incident."
  },
  {
    id: "generate_operator_brief",
    label: "Generate Operator Brief",
    prompt: "Create a short operator brief for the current scenario."
  },
  {
    id: "inspect_missing_context",
    label: "Inspect Missing Context",
    prompt: "Identify missing evidence before approving a recommendation."
  },
  {
    id: "custom",
    label: "Custom Prompt",
    prompt: ""
  },
];

export function GeminiQueryLab() {
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESETS[0]!.id);
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<GeminiResult | null>(null);

  const preset = PRESETS.find((item) => item.id === selectedPreset) ?? PRESETS[0]!;
  const resolvedPrompt = selectedPreset === "custom" ? customPrompt : preset.prompt;

  const runPrompt = async () => {
    if (!resolvedPrompt.trim()) {
      setStatus("Enter a custom prompt before running.");
      return;
    }

    setLoading(true);
    setStatus("Running Gemini test...");
    const startedAt = new Date().toISOString();
    addLogEvent({
      source: "gemini",
      type: "gemini_query_started",
      severity: "info",
      summary: `Gemini query started (${selectedPreset})`,
      details: { preset: selectedPreset },
      mode: "mock",
    });

    try {
      const response = await fetch("/api/iot-maker/gemini-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preset: selectedPreset,
          prompt: selectedPreset === "custom" ? customPrompt : preset.prompt,
        }),
      });

      const payload = (await response.json()) as GeminiResult & { error?: string };
      const durationMs = startedAt
        ? Math.max(0, new Date(payload.createdAt).getTime() - new Date(startedAt).getTime())
        : 0;

      if (!response.ok || payload.error) {
        setStatus(payload.error ?? "Gemini query failed.");
        addLogEvent({
          source: "gemini",
          type: "gemini_query_failed",
          severity: "error",
          summary: payload.error ?? "Gemini query failed",
          details: { preset: selectedPreset, error: payload.error },
          durationMs,
          mode: "demo",
        });
        return;
      }

      setResult({
        ...payload,
        durationMs,
      });
      setStatus("Gemini test completed.");

      addLogEvent({
        source: "gemini",
        type: payload.mode === "mock" ? "gemini_query_simulated" : "gemini_query_succeeded",
        severity: "success",
        summary: `Gemini query finished: ${selectedPreset}`,
        details: {
          mode: payload.mode,
          model: payload.model,
          approvalRequired: payload.approvalRequired,
          safety: payload.safetyClassification,
        },
        durationMs,
        mode: payload.mode === "mock" ? "mock" : "connected",
      });

      if (payload.toolCall) {
        addLogEvent({
          source: "gemini",
          type: "gemini_tool_call_proposed",
          severity: "warning",
          summary: `Gemini tool call proposed: ${payload.toolCall.name}`,
          details: payload.toolCall,
          durationMs,
          mode: payload.mode === "mock" ? "mock" : "connected",
        });
        addLogEvent({
          source: "operator_gate",
          type: "gemini_tool_call_blocked_for_approval",
          severity: "warning",
          summary: "Tool call remains advisory and requires operator approval.",
          details: { tool: payload.toolCall.name },
          durationMs,
          mode: "mock",
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gemini test request failed.";
      setStatus(message);
      addLogEvent({
        source: "gemini",
        type: "gemini_query_failed",
        severity: "error",
        summary: message,
        details: { preset: selectedPreset },
        mode: "mock",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    const payload = JSON.stringify(
      {
        preset: selectedPreset,
        mode: result.mode,
        model: result.model,
        responseText: result.responseText,
        toolCall: result.toolCall ?? null,
        safetyClassification: result.safetyClassification,
        approvalRequired: result.approvalRequired,
        createdAt: result.createdAt,
      },
      null,
      2
    );
    navigator.clipboard?.writeText(payload).catch(() => {});
    setStatus("Gemini result copied to clipboard.");
  };

  return (
    <Panel title="Gemini Query Lab" kicker="Structured advisory testing" icon="database" accent="violet">
      <p className="mb-3 text-sm text-slate-300">
        Run preset prompts or custom prompts against the Gemini advisor path and inspect structured outputs.
      </p>

      <div className="grid gap-3 xl:grid-cols-[220px_1fr]">
        <GeminiPresetList presets={PRESETS} selectedPreset={selectedPreset} onSelect={setSelectedPreset} />
        <GeminiPromptEditor
          value={resolvedPrompt}
          onChange={(value) => {
            if (selectedPreset === "custom") {
              setCustomPrompt(value);
            }
          }}
          showCustomPrompt={selectedPreset === "custom"}
          customPrompt={customPrompt}
          readOnly={selectedPreset !== "custom"}
          isRunning={loading}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={runPrompt}
          disabled={loading}
          className="border border-cyan-400/35 bg-cyan-400/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-cyan-100 disabled:opacity-50"
        >
          {loading ? "Testing Gemini..." : "Test Gemini"}
        </button>
        <button
          type="button"
          onClick={copyResult}
          disabled={!result}
          className="border border-emerald-400/35 bg-emerald-400/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-emerald-100 disabled:opacity-50"
        >
          Copy Result
        </button>
      </div>

      {status ? <p className="mt-3 text-xs text-cyan-200">{status}</p> : null}
      {result ? <GeminiResponseViewer result={result} /> : null}
      {result?.toolCall ? <GeminiToolCallViewer toolCall={result.toolCall} /> : null}
      <GeminiSafetyNotice selectedPreset={preset.label} mode={result?.mode} />
      <p className="mt-2 text-xs text-command-muted">
        Active prompt: <span className="text-slate-200">{resolvedPrompt}</span>
      </p>
    </Panel>
  );
}
