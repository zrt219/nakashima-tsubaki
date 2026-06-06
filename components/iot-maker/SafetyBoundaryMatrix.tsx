"use client";

import { Panel } from "@/components/tn-command-center/command-center-primitives";
import { SAFETY_MATRIX, type SafetyMatrixRow } from "@/lib/iot-maker/safetyPolicy";

function renderCell(value: SafetyMatrixRow[keyof Pick<SafetyMatrixRow, "ai" | "operator" | "edgeBridge" | "supabase" | "awsIot" | "xrpl" | "hedera" | "system">]) {
  if (value === false) return <span className="text-red-300">No</span>;
  if (value === true) return <span className="text-emerald-300">Yes</span>;
  return <span className="text-cyan-200">{value}</span>;
}

export function SafetyBoundaryMatrix() {
  return (
    <Panel title="Safety Boundary Matrix" kicker="Capability-by-capability controls" icon="shield" accent="amber">
      <p className="mb-3 text-sm text-slate-300">
        Policy summary for AI, operator, edge bridge, storage, and chain layers. This matrix enforces advisory control and prohibits machine control via blockchain.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b border-command-line/40 text-cyan-300">
              <th className="py-2 pr-3">Capability</th>
              <th className="py-2 pr-3">AI</th>
              <th className="py-2 pr-3">Operator</th>
              <th className="py-2 pr-3">Edge Bridge</th>
              <th className="py-2 pr-3">Supabase</th>
              <th className="py-2 pr-3">AWS IoT</th>
              <th className="py-2 pr-3">XRPL</th>
              <th className="py-2 pr-3">Hedera</th>
              <th className="py-2 pr-3">System</th>
            </tr>
          </thead>
          <tbody>
            {SAFETY_MATRIX.map((row) => (
              <tr key={row.capability} className="border-b border-command-line/20">
                <td className="py-2 pr-3 font-semibold text-white">{row.capability}</td>
                <td className="py-2 pr-3">{renderCell(row.ai)}</td>
                <td className="py-2 pr-3">{renderCell(row.operator)}</td>
                <td className="py-2 pr-3">{renderCell(row.edgeBridge)}</td>
                <td className="py-2 pr-3">{renderCell(row.supabase)}</td>
                <td className="py-2 pr-3">{renderCell(row.awsIot)}</td>
                <td className="py-2 pr-3">{renderCell(row.xrpl)}</td>
                <td className="py-2 pr-3">{renderCell(row.hedera)}</td>
                <td className="py-2 pr-3">{renderCell(row.system)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-3 space-y-1 text-[11px] text-command-muted">
        {SAFETY_MATRIX.map((row) => (
          <li key={`${row.capability}-desc`}><span className="text-slate-200">{row.capability}</span>: {row.systemDescription}</li>
        ))}
      </ul>
    </Panel>
  );
}
