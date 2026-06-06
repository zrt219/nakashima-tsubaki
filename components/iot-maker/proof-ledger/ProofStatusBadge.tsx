"use client";

export function ProofStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const classes =
    s === "mock_anchored" || s === "confirmed"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
      : s === "submitted"
        ? "border-cyan-400/35 bg-cyan-400/8 text-cyan-200"
        : s === "disabled"
          ? "border-cyan-300/25 bg-cyan-300/8 text-cyan-200"
          : "border-red-400/40 bg-red-400/10 text-red-200";

  return (
    <span className={`inline-flex border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${classes}`}>
      {status}
    </span>
  );
}
