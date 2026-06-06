"use client";

import { Icon } from "@/components/tn-command-center/command-center-primitives";

type NetworkItem = {
  key: "mock" | "xrpl_testnet" | "hedera_testnet" | "disabled";
  label: string;
  ready: boolean;
  description: string;
};

type Props = {
  selectedNetwork: NetworkItem["key"];
  onSelect: (network: NetworkItem["key"]) => void;
  networks: NetworkItem[];
};

export function ProofNetworkSelector({ selectedNetwork, onSelect, networks }: Props) {
  return (
    <div className="grid gap-2">
      <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Network mode</p>
      {networks.map((network) => {
        const isSelected = network.key === selectedNetwork;
        return (
          <button
            key={network.key}
            type="button"
            onClick={() => onSelect(network.key)}
            className={`w-full border p-2 text-left transition ${
              isSelected
                ? "border-violet-400/60 bg-violet-400/12 text-violet-100"
                : "border-command-line/50 bg-black/35 text-command-muted hover:border-violet-400/40 hover:text-violet-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">{network.label}</span>
              <Icon
                name={network.ready ? "check" : "triangle"}
                className={`h-3.5 w-3.5 ${network.ready ? "text-emerald-300" : "text-amber-300"}`}
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-300">{network.description}</p>
          </button>
        );
      })}
    </div>
  );
}
