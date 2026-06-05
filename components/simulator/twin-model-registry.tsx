"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSimulatorStore } from "@/lib/simulator/store";
import { TwinModelId, SimulatorState } from "@/lib/simulator/types";
import {
  generateGlobe,
  generateHelix,
  generateNeural,
  generateSpindle,
  generateGrid,
  generateOctahedron,
  generateShield,
  generateLattice,
  generateCylinder,
  generateTorus,
  generateHeatField,
  generateWaveTunnel,
  generateErodingGeometry,
  generateFlowNetwork,
  generateOrb,
} from "@/components/tn-command-center/webgl-geometries";

interface TwinModelRegistryProps {
  modelId: TwinModelId;
  particleCount?: number;
}

/**
 * Universal component that renders any of the 15 Twin Models and automatically
 * reacts to the global Simulator State.
 */
export function TwinModelRegistry({ modelId, particleCount = 4000 }: TwinModelRegistryProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const simState = useSimulatorStore((s) => s.state);

  // Generate geometry based on modelId
  const positions = useMemo(() => {
    switch (modelId) {
      case "executive-fleet-globe": return generateGlobe(particleCount, 3.5);
      case "roadmap-dna-helix": return generateHelix(particleCount, 12, 2.5);
      case "rag-neural-knowledge-graph": return generateNeural(particleCount);
      case "simulator-chaotic-spindle": return generateSpindle(particleCount, true);
      case "ledger-blockchain-cube-grid": return generateGrid(particleCount, 7);
      case "advisory-icosahedron-core": return generateOctahedron(particleCount, 3);
      case "governance-protective-shield": return generateShield(particleCount, 2.5, 3.5);
      case "architecture-layered-lattice": return generateLattice(particleCount, 6, 7);
      case "kpi-rose-telemetry-cylinder": return generateCylinder(particleCount, 2.5, 8);
      case "qa-inspection-torus": return generateTorus(particleCount, 3.5, 1.2);
      case "thermal-heat-field-reactor": return generateHeatField(particleCount, 4);
      case "vibration-resonance-tunnel": return generateWaveTunnel(particleCount, 2.5, 10);
      case "tool-wear-eroding-edge": return generateErodingGeometry(particleCount, 5);
      case "supply-chain-flow-network": return generateFlowNetwork(particleCount, 8);
      case "operator-approval-gate-orb": return generateOrb(particleCount, 3.5);
      default: return generateGlobe(particleCount, 3);
    }
  }, [modelId, particleCount]);

  // Determine state-based aesthetics
  const stateColor = useMemo(() => {
    switch (simState) {
      case "IDLE": return new THREE.Color(0x3b82f6); // Blue
      case "SCENARIO_SELECTED": return new THREE.Color(0x8b5cf6); // Purple
      case "INCIDENT_SEEDED": return new THREE.Color(0xf59e0b); // Amber
      case "SIGNAL_DETECTED": return new THREE.Color(0xf97316); // Orange
      case "APPROVAL_REQUIRED": return new THREE.Color(0xef4444); // Red pulse
      case "SHADOW_EXECUTION_RUNNING": return new THREE.Color(0x10b981); // Emerald
      case "EVIDENCE_CAPTURED": return new THREE.Color(0x0ea5e9); // Sky
      default: return new THREE.Color(0x64748b); // Slate fallback
    }
  }, [simState]);

  useFrame((state) => {
    if (pointsRef.current) {
      // Base rotation
      pointsRef.current.rotation.y += 0.002;
      pointsRef.current.rotation.x += 0.001;

      // State-based reactivity (e.g. erratic spinning on incident)
      if (simState === "INCIDENT_SEEDED" || simState === "SIGNAL_DETECTED") {
        pointsRef.current.rotation.y += 0.01;
        pointsRef.current.rotation.z += 0.005;
      }
    }
    
    // Smoothly interpolate color toward the target state color
    if (materialRef.current) {
      materialRef.current.color.lerp(stateColor, 0.05);
      
      // Pulse size if approval required
      if (simState === "APPROVAL_REQUIRED") {
        materialRef.current.size = 0.02 + Math.sin(state.clock.elapsedTime * 5) * 0.01;
      } else {
        materialRef.current.size = 0.02;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.02}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
