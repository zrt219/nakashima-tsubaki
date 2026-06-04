"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { StatusKind } from "@/lib/tn-ai-data";

export type IconName =
  | "check"
  | "triangle"
  | "pulse"
  | "hand"
  | "lock"
  | "hash"
  | "shield"
  | "mission"
  | "roadmap"
  | "rag"
  | "twin"
  | "flow"
  | "stack"
  | "chart"
  | "evidence"
  | "arrow"
  | "play"
  | "pause"
  | "database"
  | "search"
  | "power"
  | "github";

const statusMeta: Record<
  StatusKind,
  {
    label: string;
    icon: IconName;
    dotColor: string;
    chipClass: string;
    glowClass: string;
    description: string;
  }
> = {
  ready: {
    label: "READY",
    icon: "check",
    dotColor: "bg-cyan-400",
    chipClass:
      "border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-200 shadow-[0_0_8px_rgba(0,212,255,0.15)]",
    glowClass: "shadow-[0_0_16px_rgba(0,212,255,0.35)]",
    description: "Validated demo state"
  },
  review: {
    label: "REVIEW",
    icon: "triangle",
    dotColor: "bg-amber-400",
    chipClass:
      "border-amber-400/40 bg-amber-400/[0.1] text-amber-200 shadow-[0_0_8px_rgba(255,184,77,0.15)]",
    glowClass: "shadow-[0_0_16px_rgba(255,184,77,0.35)]",
    description: "Needs engineer review"
  },
  simulated: {
    label: "SIMULATED",
    icon: "pulse",
    dotColor: "bg-slate-400",
    chipClass:
      "border-slate-400/30 bg-slate-400/[0.08] text-slate-200",
    glowClass: "",
    description: "Local mocked data"
  },
  approval: {
    label: "OPERATOR APPROVAL REQUIRED",
    icon: "hand",
    dotColor: "bg-amber-300",
    chipClass:
      "border-amber-300/50 bg-amber-300/[0.12] text-amber-100 shadow-[0_0_10px_rgba(255,184,77,0.2)]",
    glowClass: "shadow-[0_0_20px_rgba(255,184,77,0.4)]",
    description: "Human gate required"
  },
  locked: {
    label: "LOCKED",
    icon: "lock",
    dotColor: "bg-slate-500",
    chipClass:
      "border-slate-500/30 bg-slate-500/[0.08] text-slate-300",
    glowClass: "",
    description: "Protected control"
  },
  testnet: {
    label: "TESTNET / PERMISSIONED",
    icon: "hash",
    dotColor: "bg-violet-400",
    chipClass:
      "border-violet-400/35 bg-violet-400/[0.1] text-violet-200 shadow-[0_0_8px_rgba(155,109,255,0.15)]",
    glowClass: "shadow-[0_0_16px_rgba(155,109,255,0.35)]",
    description: "Hash-only ledger mode"
  },
  advisory: {
    label: "ADVISORY ONLY",
    icon: "shield",
    dotColor: "bg-amber-400",
    chipClass:
      "border-amber-400/35 bg-amber-400/[0.09] text-amber-100",
    glowClass: "",
    description: "No direct machine control"
  }
};

export function StatusChip({
  status,
  compact = false
}: {
  status: StatusKind;
  compact?: boolean;
}) {
  const meta = statusMeta[status];
  const isPulsing = status === "ready" || status === "approval";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] backdrop-blur-sm transition-all duration-300 ${meta.chipClass}`}
      title={meta.description}
    >
      {/* Animated dot */}
      <span className="relative inline-flex h-2 w-2 shrink-0">
        {isPulsing && (
          <span
            className={`status-ping absolute inline-flex h-full w-full rounded-full ${meta.dotColor} opacity-60`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${meta.dotColor}`} />
      </span>
      <span className="truncate">
        {compact ? meta.label.replace("OPERATOR ", "") : meta.label}
      </span>
    </span>
  );
}

export function Panel({
  title,
  kicker,
  icon,
  action,
  accent = "cyan",
  children
}: {
  title: string;
  kicker: string;
  icon: IconName;
  action?: ReactNode;
  accent?: "cyan" | "amber" | "violet" | "emerald";
  children: ReactNode;
}) {
  const accentColors = {
    cyan: {
      icon: "border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-200",
      kicker: "text-cyan-400/60",
      bar: "bg-gradient-to-r from-cyan-400/60 via-cyan-300/30 to-transparent"
    },
    amber: {
      icon: "border-amber-400/30 bg-amber-400/[0.08] text-amber-200",
      kicker: "text-amber-400/60",
      bar: "bg-gradient-to-r from-amber-400/60 via-amber-300/30 to-transparent"
    },
    violet: {
      icon: "border-violet-400/30 bg-violet-400/[0.08] text-violet-200",
      kicker: "text-violet-400/60",
      bar: "bg-gradient-to-r from-violet-400/60 via-violet-300/30 to-transparent"
    },
    emerald: {
      icon: "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200",
      kicker: "text-emerald-400/60",
      bar: "bg-gradient-to-r from-emerald-400/60 via-emerald-300/30 to-transparent"
    }
  };

  const ac = accentColors[accent];

  return (
    <motion.section 
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="corner-accent glass-panel relative overflow-hidden p-4 xl:p-5 bg-black/40 backdrop-blur-xl"
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] ${ac.bar}`} />

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center border ${ac.icon} transition-all duration-300`}
          >
            <Icon name={icon} className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${ac.kicker}`}>
              {kicker}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
          </div>
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}

export function SystemLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="data-line flex items-center justify-between gap-3 text-xs font-mono">
      <span className="text-command-muted">{label}</span>
      <span className="text-right font-medium text-command-text">{value}</span>
    </div>
  );
}

export function ComparisonBlock({
  label,
  text,
  good = false
}: {
  label: string;
  text: string;
  good?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`relative overflow-hidden border p-3 backdrop-blur-md ${
        good
          ? "border-cyan-400/20 bg-cyan-400/[0.08] hover:border-cyan-400/40"
          : "border-amber-400/20 bg-amber-400/[0.08] hover:border-amber-400/40"
      }`}
    >
      {good && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/40 to-transparent" />
      )}
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
          good ? "text-cyan-400/70" : "text-amber-400/70"
        }`}
      >
        {label}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-300">{text}</p>
    </motion.div>
  );
}

export function ButtonLinkLike({
  children,
  tone = "primary"
}: {
  children: ReactNode;
  tone?: "primary" | "secondary";
}) {
  const className =
    tone === "primary"
      ? "border-cyan-400/40 bg-cyan-400/[0.1] text-cyan-100 hover:bg-cyan-400/[0.18] hover:border-cyan-400/60 shadow-[0_0_12px_rgba(0,212,255,0.1)] hover:shadow-[0_0_20px_rgba(0,212,255,0.25)]"
      : "border-command-line bg-white/[0.03] text-command-text hover:border-cyan-400/30 hover:bg-white/[0.06]";

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`btn-glow inline-flex items-center gap-2 border px-3 py-2 text-sm font-semibold backdrop-blur-md ${className}`}
    >
      {children}
    </motion.span>
  );
}

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const common =
    "fill-none stroke-current stroke-[1.6] [stroke-linecap:square] [stroke-linejoin:miter]";

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {name === "check" && <path className={common} d="M4.5 12.5 9.5 17.5 19.5 6.5" />}
      {name === "triangle" && (
        <path className={common} d="M12 4 21 20H3L12 4ZM12 9V14M12 17H12.01" />
      )}
      {name === "pulse" && <path className={common} d="M3 12H7L9 6L13 18L16 10H21" />}
      {name === "hand" && (
        <path
          className={common}
          d="M8 12V5.5A1.5 1.5 0 0 1 11 5.5V11M11 10V4.5A1.5 1.5 0 0 1 14 4.5V11M14 10V6A1.5 1.5 0 0 1 17 6V13M8 12L6.5 10.5A1.7 1.7 0 0 0 4 12.8L9 20H17.5L20 14V9A1.5 1.5 0 0 0 17 9"
        />
      )}
      {name === "lock" && (
        <path className={common} d="M7 10V7A5 5 0 0 1 17 7V10M6 10H18V21H6V10ZM12 15V17" />
      )}
      {name === "hash" && <path className={common} d="M9 3 7 21M17 3 15 21M4 8H20M3 16H19" />}
      {name === "shield" && (
        <path className={common} d="M12 3 20 6V11C20 16 16.5 19.5 12 21C7.5 19.5 4 16 4 11V6L12 3Z" />
      )}
      {name === "mission" && (
        <path
          className={common}
          d="M12 3V21M3 12H21M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5M8 12A4 4 0 1 0 16 12A4 4 0 0 0 8 12Z"
        />
      )}
      {name === "roadmap" && (
        <path className={common} d="M5 5H9L15 19H19M5 5L9 19M9 5H19M5 19H15" />
      )}
      {name === "rag" && <path className={common} d="M5 4H19V18H8L5 21V4ZM8 8H16M8 12H14" />}
      {name === "twin" && (
        <path className={common} d="M6 7 12 4 18 7V17L12 20 6 17V7ZM6 7 12 10 18 7M12 10V20" />
      )}
      {name === "flow" && (
        <path className={common} d="M5 6H11V12H5V6ZM13 12H19V18H13V12ZM8 12V16H13M11 9H16V12" />
      )}
      {name === "stack" && (
        <path className={common} d="M12 3 21 8 12 13 3 8 12 3ZM3 12 12 17 21 12M3 16 12 21 21 16" />
      )}
      {name === "chart" && <path className={common} d="M4 19H20M7 16V10M12 16V5M17 16V8" />}
      {name === "evidence" && (
        <path
          className={common}
          d="M7 3H15L19 7V21H7V3ZM14 3V8H19M10 12H16M10 16H15M4 7V17"
        />
      )}
      {name === "arrow" && <path className={common} d="M5 12H19M13 6 19 12 13 18" />}
      {name === "play" && <path className={common} d="M7 5V19L19 12L7 5Z" />}
      {name === "pause" && <path className={common} d="M8 5V19M16 5V19" />}
      {name === "database" && (
        <path
          className={common}
          d="M5 7C5 5.34 8.13 4 12 4S19 5.34 19 7 15.87 10 12 10 5 8.66 5 7ZM5 12C5 13.66 8.13 15 12 15S19 13.66 19 12M5 17C5 18.66 8.13 20 12 20S19 18.66 19 17M5 7V17M19 7V17"
        />
      )}
      {name === "search" && (
        <path
          className={common}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      )}
      {name === "power" && (
        <path
          className={common}
          d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"
        />
      )}
      {name === "github" && (
        <path
          className={common}
          fill="currentColor"
          stroke="none"
          d="M12 2C6.47 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
        />
      )}
    </svg>
  );
}
