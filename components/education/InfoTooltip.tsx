"use client";

import { useId, useState } from "react";

type InfoTooltipProps = {
  id?: string;
  content: string;
  className?: string;
  placement?: "top" | "right";
};

export function InfoTooltip({
  id,
  content,
  className = "",
  placement = "top",
}: InfoTooltipProps) {
  const fallbackId = useId();
  const tooltipId = id ?? `${fallbackId}-tooltip`;
  const [open, setOpen] = useState(false);

  const positionClass =
    placement === "right" ? "left-9 top-0" : "left-0 top-9";

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        aria-describedby={tooltipId}
        aria-expanded={open}
        aria-label="Show panel explanation"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((state) => !state)}
        className="grid h-4 w-4 place-items-center border border-cyan-400/40 bg-cyan-400/10 text-[10px] font-semibold text-cyan-200"
      >
        ?
      </button>
      <span
        id={tooltipId}
        role="note"
        className={`pointer-events-none absolute z-20 w-64 rounded border border-cyan-400/40 bg-black/95 px-3 py-2 text-left text-[11px] text-cyan-100 shadow-[0_0_12px_rgba(0,212,255,0.2)] transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        } ${positionClass}`}
      >
        {content}
      </span>
    </span>
  );
}
