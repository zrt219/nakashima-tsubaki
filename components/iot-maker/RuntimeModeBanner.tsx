"use client";

type RuntimeModeBannerProps = {
  runtimeMode: "demo" | "partial" | "connected" | "blocked";
  proofMode: string;
  isSafe: boolean;
};

const runtimeModeCopy: Record<RuntimeModeBannerProps["runtimeMode"], { label: string; tone: string; detail: string }> = {
  demo: {
    label: "DEMO MODE",
    tone: "border-amber-300/50 bg-amber-300/10 text-amber-100",
    detail: "Safe local simulator control. Evidence is anchored as hashes only."
  },
  partial: {
    label: "PARTIAL CONNECTED",
    tone: "border-cyan-300/35 bg-cyan-300/8 text-cyan-100",
    detail: "Some connected prerequisites exist, but not all required services are present."
  },
  connected: {
    label: "CONNECTED READY",
    tone: "border-emerald-300/40 bg-emerald-300/10 text-emerald-100",
    detail: "Connected simulation path is available. AWS publish still remains advisory-first."
  },
  blocked: {
    label: "BLOCKED",
    tone: "border-red-300/50 bg-red-300/10 text-red-100",
    detail: "Blocker present in safety gate. Commands cannot be considered approved for dispatch."
  }
};

export function RuntimeModeBanner({
  runtimeMode,
  proofMode,
  isSafe
}: RuntimeModeBannerProps) {
  const style = runtimeModeCopy[runtimeMode];

  return (
    <section className={`border ${style.tone} px-4 py-3`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-mono tracking-widest">{style.label}</p>
        <p className="text-xs text-command-muted">Proof mode: {proofMode}</p>
      </div>
      <p className="mt-1 text-sm">{style.detail}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-command-muted">
        Safety posture: {isSafe ? "APPROVAL GATE ACTIVE" : "BLOCKED"}
      </p>
    </section>
  );
}
