"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, Zap, ShieldCheck, Cpu, 
  ArrowRight, FileCheck, Anchor, 
  ExternalLink, Hash, Clock
} from "lucide-react";
import { processIoTAction } from "@/app/iot-maker/actions";

export function IoTMakerCenter() {
  const [actionType, setActionType] = useState("MACHINE_CALIBRATION");
  const [parameter, setParameter] = useState("10");
  const [status, setStatus] = useState<"idle" | "hashing" | "anchoring" | "success" | "error">("idle");
  const [result, setResult] = useState<any>(null);

  const handleExecute = async () => {
    setStatus("hashing");
    
    // Simulate hashing visualization delay
    await new Promise(r => setTimeout(r, 800));
    setStatus("anchoring");

    const formData = new FormData();
    formData.set("action_type", actionType);
    formData.set("parameter", parameter);

    try {
      const res = await processIoTAction(formData);
      if (res.success) {
        setResult(res.data);
        setStatus("success");
      } else {
        setStatus("error");
        console.error("Action failed:", res.error);
      }
    } catch (err) {
      setStatus("error");
      console.error(err);
    }
  };

  return (
    <div className="w-full h-full relative overflow-y-auto overflow-x-hidden p-6 text-white custom-scrollbar">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-white mb-2 flex items-center gap-3">
              <Zap className="w-8 h-8 text-amber-400" />
              IoT Maker
            </h1>
            <p className="text-white/60 text-lg">Direct Command & Multi-Chain Ledger Proofs</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs text-white/50">Active Proof Mode</div>
                <div className="text-sm font-medium">{process.env.NEXT_PUBLIC_PROOF_MODE || "MOCK"}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Command Configuration */}
          <motion.div 
            className="bg-[#0c1222]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-6 text-white/80">
              <Cpu className="w-5 h-5" />
              <h2 className="text-xl font-medium">Command Matrix</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Action Type</label>
                <select 
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={status === "hashing" || status === "anchoring"}
                >
                  <option value="MACHINE_CALIBRATION">Machine Calibration</option>
                  <option value="SPINDLE_SPEED_OVERRIDE">Spindle Speed Override</option>
                  <option value="EMERGENCY_HALT">Emergency Halt</option>
                  <option value="THERMAL_RESET">Thermal Reset</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Parameter / Value</label>
                <input 
                  type="text" 
                  value={parameter}
                  onChange={(e) => setParameter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 1000 RPM"
                  disabled={status === "hashing" || status === "anchoring"}
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleExecute}
                  disabled={status === "hashing" || status === "anchoring"}
                  className="w-full group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 px-6 py-4 font-medium text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {status === "idle" || status === "error" || status === "success" ? (
                      <>Execute & Anchor <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                    ) : (
                      <>{status === "hashing" ? "Canonicalizing & Hashing..." : "Anchoring to Ledger..."}</>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Ledger Proof Journey */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {status !== "idle" && (
                <motion.div
                  key="hashing-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#0c1222]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${status === "hashing" ? "bg-amber-500/20 text-amber-400 animate-pulse" : "bg-emerald-500/20 text-emerald-400"}`}>
                      <Hash className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Deterministic Hashing</h3>
                      <p className="text-xs text-white/50">SHA-256 Digest generated from payload</p>
                    </div>
                  </div>
                  
                  {(status === "anchoring" || status === "success") && result && (
                    <div className="bg-black/40 rounded-lg p-3 font-mono text-xs text-emerald-400 break-all border border-white/5">
                      {result.anchorResult.evidence_hash}
                    </div>
                  )}
                </motion.div>
              )}

              {(status === "anchoring" || status === "success") && (
                <motion.div
                  key="anchoring-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#0c1222]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${status === "anchoring" ? "bg-indigo-500/20 text-indigo-400 animate-pulse" : "bg-emerald-500/20 text-emerald-400"}`}>
                      <Anchor className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Blockchain Anchor</h3>
                      <p className="text-xs text-white/50">Broadcasting proof to distributed ledger</p>
                    </div>
                  </div>

                  {status === "success" && result && (
                    <div className="space-y-3">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                          <FileCheck className="w-4 h-4" />
                          <span className="font-medium text-sm">Successfully Anchored</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <div className="text-xs text-white/40 mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Block / Index</div>
                            <div className="text-sm font-medium">{result.anchorResult.block_number || result.anchorResult.ledger_index || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-xs text-white/40 mb-1">Transaction</div>
                            <div className="text-sm font-medium truncate" title={result.anchorResult.transaction_hash}>
                              {result.anchorResult.transaction_hash?.substring(0, 10)}...
                            </div>
                          </div>
                        </div>

                        {result.anchorResult.explorer_url && (
                          <a 
                            href={result.anchorResult.explorer_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-black/30 hover:bg-black/50 transition-colors rounded-lg text-sm text-indigo-300 hover:text-indigo-200 border border-indigo-500/20"
                          >
                            View on Explorer <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
