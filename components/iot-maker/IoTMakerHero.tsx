"use client";

import { Panel } from "@/components/tn-command-center/command-center-primitives";

const SAFETY_CHIPS = [
  "DEMO READY",
  "CONNECTED MODE OPTIONAL",
  "APPROVAL REQUIRED",
  "NO DIRECT PLC CONTROL",
  "PROOF LEDGER ENABLED",
  "SERVER-SIDE SECRETS ONLY",
];

export function IoTMakerHero() {
  return (
    <Panel title="IoT Maker" kicker="Commissioning Studio" icon="hash" accent="violet" action={<span className="text-[10px] text-command-muted">SIMULATED & LOCAL CONTROL</span>}>
      <h3 className="text-xl font-semibold text-white">Commissioning studio for the cyber-physical AI stack.</h3>
      <p className="mt-2 max-w-3xl text-sm text-slate-300">
        Run the Tsubaki-Nakashima AI Command Center instantly in Demo Mode, then connect Supabase,
        AWS IoT Core, Gemini/OpenAI, XRPL Testnet, and Hedera Testnet through server-side environment
        variables when ready.
      </p>
      <p className="mt-2 text-xs text-cyan-200/80">
        Demo packets are intentionally marked <span className="font-mono">DEMO</span> and cannot control physical machines.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {SAFETY_CHIPS.map((chip) => (
          <span
            key={chip}
            className="border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200"
          >
            {chip}
          </span>
        ))}
      </div>
    </Panel>
  );
}
