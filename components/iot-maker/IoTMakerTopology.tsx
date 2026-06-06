"use client";

import { TOPOLOGY_EDGES, TOPOLOGY_NODES } from "@/lib/iot-maker/topology";
import { Panel } from "@/components/tn-command-center/command-center-primitives";

const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 100;

function nodeX(positionX: number) {
  return (positionX / 100) * VIEW_WIDTH;
}

function nodeY(positionY: number) {
  return (positionY / 100) * VIEW_HEIGHT;
}

export function IoTMakerTopology() {
  return (
    <Panel title="Topology Graph" kicker="Cyber-physical architecture" icon="flow" accent="cyan">
      <p className="mb-3 text-xs text-slate-300">
        This simulator map is advisory-first: AI and edge components never bypass the operator gate.
      </p>
      <div className="rounded border border-cyan-500/25 bg-black/40 p-4">
        <svg viewBox="0 0 100 100" className="h-auto w-full">
          {TOPOLOGY_EDGES.map((edge) => {
            const from = TOPOLOGY_NODES.find((node) => node.id === edge.from);
            const to = TOPOLOGY_NODES.find((node) => node.id === edge.to);
            if (!from || !to) return null;
            const isBlocked = edge.allowed === false;
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={nodeX(from.x)}
                  y1={nodeY(from.y)}
                  x2={nodeX(to.x)}
                  y2={nodeY(to.y)}
                  stroke={isBlocked ? "#f59e0b55" : "#22d3ee66"}
                  strokeDasharray={isBlocked ? "2,2" : "0"}
                  strokeWidth="0.4"
                />
                <text
                  x={(nodeX(from.x) + nodeX(to.x)) / 2}
                  y={(nodeY(from.y) + nodeY(to.y)) / 2}
                  fill={isBlocked ? "#f59e0b" : "#93c5fd"}
                  fontSize="2.5"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {TOPOLOGY_NODES.map((node) => {
            const x = nodeX(node.x);
            const y = nodeY(node.y);
            return (
              <g key={node.id}>
                <circle cx={x} cy={y} r="4.6" fill={node.layer === "proof" ? "#0ea5e9" : "#22d3ee"} opacity="0.95" />
                <text x={x} y={y + 7} textAnchor="middle" fill="#e2e8f0" fontSize="2.7">
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Panel>
  );
}
