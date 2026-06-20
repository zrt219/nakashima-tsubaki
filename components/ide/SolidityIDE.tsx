"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { ethers } from "ethers";
import { Icon, Panel, StatusChip } from "@/components/tn-command-center/command-center-primitives";
import { LearningTrigger } from "@/components/education/AcademicOverlay";

const DEFAULT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DigitalTwinGovernance {
    address public owner;
    
    struct EdgeAutomation {
        string scenarioId;
        string expectedHash;
        bool authorized;
    }
    
    mapping(string => EdgeAutomation) public automations;

    constructor() {
        owner = msg.sender;
    }

    function registerAutomation(string memory scenarioId, string memory expectedHash) public {
        require(msg.sender == owner, "Unauthorized");
        automations[scenarioId] = EdgeAutomation(scenarioId, expectedHash, true);
    }
}
`;

// Use a local Next.js API route as a proxy to bypass browser CORS restrictions.
// Ethers will sign the transaction locally with the private key, and only send the signed payload.
const NETWORKS = {
  xrpl: { id: "xrpl", name: "XRPL EVM Sidechain Testnet", proxy: "/api/rpc/xrpl-evm", currency: "XRP" },
  hedera: { id: "hedera", name: "Hedera EVM Testnet", proxy: "/api/rpc/hedera-evm", currency: "HBAR" },
};

export function SolidityIDE() {
  const [network, setNetwork] = useState<"xrpl" | "hedera">("xrpl");
  const [sourceCode, setSourceCode] = useState(DEFAULT_CODE);
  const [privateKey, setPrivateKey] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [compiledData, setCompiledData] = useState<{ abi: any; bytecode: string; contractName: string } | null>(null);

  const logToConsole = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setCompiledData(null);
    logToConsole("Starting compilation via solc...");

    try {
      const res = await fetch("/api/ide/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        logToConsole(`Compilation Error: ${JSON.stringify(data.details || data.error)}`);
      } else {
        logToConsole(`Successfully compiled contract: ${data.contractName}`);
        setCompiledData({ abi: data.abi, bytecode: data.bytecode, contractName: data.contractName });
      }
    } catch (err: any) {
      logToConsole(`Error: ${err.message}`);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDeploy = async () => {
    if (!compiledData) {
      logToConsole("Please compile the contract first.");
      return;
    }
    if (!privateKey) {
      logToConsole("Error: Please provide a valid EVM private key.");
      return;
    }

    setIsDeploying(true);
    const selectedNetwork = NETWORKS[network];
    const rpcUrl = window.location.origin + selectedNetwork.proxy;
    logToConsole(`Connecting to ${selectedNetwork.name} Proxy (${rpcUrl})...`);

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      
      const balance = await provider.getBalance(wallet.address);
      logToConsole(`Wallet connected: ${wallet.address}`);
      logToConsole(`Balance: ${ethers.formatEther(balance)} ${selectedNetwork.currency}`);

      if (balance === 0n) {
        logToConsole(`Warning: Wallet has 0 ${selectedNetwork.currency}. Deployment will likely fail.`);
      }

      logToConsole(`Broadcasting deployment transaction to ${selectedNetwork.name}...`);
      
      const factory = new ethers.ContractFactory(compiledData.abi, compiledData.bytecode, wallet);
      const contract = await factory.deploy();
      
      logToConsole(`Transaction sent! Hash: ${contract.deploymentTransaction()?.hash}`);
      logToConsole("Waiting for confirmation...");
      
      await contract.waitForDeployment();
      const address = await contract.getAddress();
      
      logToConsole(`Success! Contract deployed to: ${address}`);
      
    } catch (err: any) {
      logToConsole(`Deployment Error: ${err.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex h-full w-full gap-4">
      <div className="flex-1 overflow-hidden border border-white/10 bg-black/40 relative">
        <Editor
          height="100%"
          defaultLanguage="solidity"
          theme="vs-dark"
          value={sourceCode}
          onChange={(val) => setSourceCode(val || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "var(--font-mono)",
            padding: { top: 16 },
          }}
        />
      </div>

      <div className="w-1/3 flex flex-col gap-4 overflow-y-auto">
        <Panel title="XRPL EVM Compiler" icon="workflow" kicker="Solc Target" action={<StatusChip status="simulated" compact />}>
          <p className="text-xs text-slate-300 mb-4">
            Compile your Solidity smart contract into EVM bytecode compatible with the XRPL EVM Sidechain.
          </p>
          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className="w-full border border-cyan-500/50 bg-cyan-500/20 py-2 text-xs font-bold text-cyan-400 transition hover:bg-cyan-500/30 disabled:opacity-50"
          >
            {isCompiling ? "Compiling..." : "Compile Contract"}
          </button>
        </Panel>

        <LearningTrigger topic="blockchain_fit">
        <Panel title="Network Deployment" icon="network" kicker="EVM Target" action={<StatusChip status="testnet" compact />}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 block">Target Network</label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as "xrpl" | "hedera")}
                className="w-full border border-white/10 bg-black p-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none mb-3"
              >
                <option value="xrpl">{NETWORKS.xrpl.name}</option>
                <option value="hedera">{NETWORKS.hedera.name}</option>
              </select>

              <label className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 block">Deployer Private Key</label>
              <input
                type="password"
                placeholder="0x..."
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full border border-white/10 bg-black p-2 text-sm text-white font-mono placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
              />
              <p className="text-[9px] text-amber-500/70 mt-1 uppercase">Key is never sent to the server. Stored in memory only.</p>
            </div>
            
            <button
              onClick={handleDeploy}
              disabled={isDeploying || !compiledData}
              className="w-full border border-emerald-500/50 bg-emerald-500/20 py-2 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/30 disabled:opacity-50"
            >
              {isDeploying ? "Deploying..." : `Deploy to ${network === "xrpl" ? "XRPL" : "Hedera"} Testnet`}
            </button>
          </div>
        </Panel>
        </LearningTrigger>

        <Panel title="Output Console" icon="cpu" kicker="Deployment Logs" className="flex-1">
          <div className="h-full w-full bg-black/60 border border-white/10 p-3 font-mono text-[10px] text-slate-300 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <span className="text-slate-600">No logs. Compile to begin.</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="break-words">
                  {log.includes("Error") || log.includes("Failed") ? (
                    <span className="text-red-400">{log}</span>
                  ) : log.includes("Success") || log.includes("Successfully") ? (
                    <span className="text-emerald-400">{log}</span>
                  ) : log.includes("Warning") ? (
                    <span className="text-amber-400">{log}</span>
                  ) : (
                    log
                  )}
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
