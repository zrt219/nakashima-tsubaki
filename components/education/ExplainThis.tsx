"use client";

import { ReactNode } from "react";
import { InfoTooltip } from "@/components/education/InfoTooltip";

type ExplainThisProps = {
  label: string;
  explanation: string;
  children: ReactNode;
};

export function ExplainThis({ label, explanation, children }: ExplainThisProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 text-xs uppercase tracking-[0.16em] text-cyan-300">
        <span>{label}</span>
        <InfoTooltip content={explanation} />
      </div>
      {children}
    </div>
  );
}
