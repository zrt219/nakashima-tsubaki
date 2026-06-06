"use client";

import { useState } from "react";

type Props = {
  proofMode: "mock" | "xrpl_testnet" | "hedera_testnet" | "disabled";
  evidenceHash?: string;
  onVerified: (result: { verified: boolean; detail: string }) => void;
};

export function VerifyProofButton({ proofMode, evidenceHash, onVerified }: Props) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!evidenceHash) return;
    setIsBusy(true);
    setError("");
    try {
      const response = await fetch("/api/proof-ledger/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidenceHash, mode: proofMode }),
      });
      const payload = (await response.json()) as {
        verified?: boolean;
        detail?: string;
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error || "Verification endpoint returned an error.");
      } else {
        onVerified({
          verified: Boolean(payload.verified),
          detail: payload.detail || "No detail returned.",
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleVerify}
        disabled={isBusy || !evidenceHash}
        className="w-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-cyan-500/20"
      >
        {isBusy ? "Verifying..." : "Verify Evidence Hash"}
      </button>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
