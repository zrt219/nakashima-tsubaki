"use client";

import { ReactNode } from "react";
import { InfoTooltip } from "@/components/education/InfoTooltip";

type GlossaryTermProps = {
  term: string;
  definition: string;
  children?: ReactNode;
};

export function GlossaryTerm({ term, definition, children }: GlossaryTermProps) {
  return (
    <span className="inline-flex items-center gap-2 border border-command-line/50 bg-black/30 px-2 py-1">
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-cyan-200">{term}</span>
      <InfoTooltip content={definition} />
      {children}
    </span>
  );
}
