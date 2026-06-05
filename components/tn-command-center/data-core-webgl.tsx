"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float, PointMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Glitch, ChromaticAberration } from "@react-three/postprocessing";
import { GlitchMode, BlendFunction } from "postprocessing";
import * as THREE from "three";
import { usePathname } from "next/navigation";
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
  generateCentrifugeFEA
} from "./webgl-geometries";

export type TwinModelId =
  | "executive-globe"
  | "roadmap-helix"
  | "rag-knowledge-graph"
  | "simulator-chaotic-spindle"
  | "ledger-blockchain-grid"
  | "advisory-decision-core"
  | "governance-shield"
  | "architecture-lattice"
  | "kpi-telemetry-cylinder"
  | "qa-inspection-torus"
  | "thermal-heat-field"
  | "vibration-wave-tunnel"
  | "tool-wear-geometry"
  | "supply-chain-flow"
  | "operator-approval-orb"
  | "stuxnet-centrifuge";

export type WebGLSignalState = "normal" | "watch" | "warning" | "critical";

function getTwinConfig(areaOrModel: string, state: WebGLSignalState) {
  // Determine base color and animation intensity based on state
  let color = "#00d4ff"; // Normal Cyan
  let intensity = 1;
  let pulse = 0.02;

  if (state === "watch") {
    color = "#f59e0b"; // Amber
    intensity = 1.5;
    pulse = 0.08;
  } else if (state === "warning") {
    color = "#ef4444"; // Red
    intensity = 2.0;
    pulse = 0.15;
  } else if (state === "critical") {
    color = "#b91c1c"; // Dark Red / Chaotic
    intensity = 3.0;
    pulse = 0.25;
  }

  // Model Mapping
  switch(areaOrModel) {
    // Exact Model IDs
    case "executive-globe": return { generate: generateGlobe, color, rotSpeed: 0.05 * intensity, pulse, cameraZ: 6, args: [], size: 0.02 };
    case "roadmap-helix": return { generate: generateHelix, color: state === "normal" ? "#ffb84d" : color, rotSpeed: 0.1 * intensity, pulse, cameraZ: 12, args: [], size: 0.03 };
    case "rag-knowledge-graph": return { generate: generateNeural, color: state === "normal" ? "#9b6dff" : color, rotSpeed: 0.02 * intensity, pulse, cameraZ: 7, args: [], size: 0.03 };
    case "simulator-chaotic-spindle": return { generate: generateSpindle, color, rotSpeed: 0.4 * intensity, pulse, cameraZ: 8, args: [true], size: 0.04 };
    case "ledger-blockchain-grid": return { generate: generateGrid, color: state === "normal" ? "#00e5a0" : color, rotSpeed: 0.05 * intensity, pulse, cameraZ: 9, args: [], size: 0.03 };
    case "advisory-decision-core": return { generate: generateOctahedron, color: state === "normal" ? "#e8f4ff" : color, rotSpeed: 0.1 * intensity, pulse, cameraZ: 7, args: [], size: 0.03 };
    case "governance-shield": return { generate: generateShield, color: state === "normal" ? "#00e5a0" : color, rotSpeed: 0.08 * intensity, pulse, cameraZ: 7, args: [], size: 0.02 };
    case "architecture-lattice": return { generate: generateLattice, color: state === "normal" ? "#0099bb" : color, rotSpeed: 0.05 * intensity, pulse, cameraZ: 8, args: [], size: 0.03 };
    case "kpi-telemetry-cylinder": return { generate: generateCylinder, color: state === "normal" ? "#ff4d7a" : color, rotSpeed: 0.2 * intensity, pulse, cameraZ: 10, args: [], size: 0.03 };
    case "qa-inspection-torus": return { generate: generateTorus, color: state === "normal" ? "#ffb84d" : color, rotSpeed: 0.15 * intensity, pulse, cameraZ: 8, args: [], size: 0.03 };
    case "thermal-heat-field": return { generate: generateCentrifugeFEA, color: state === "normal" ? "#ff6600" : color, rotSpeed: 0.05 * intensity, pulse, cameraZ: 7, args: [state === "critical" ? 1.0 : state === "warning" ? 0.6 : 0.2], size: 0.05 };
    case "vibration-wave-tunnel": return { generate: generateWaveTunnel, color, rotSpeed: 0.8 * intensity, pulse, cameraZ: 6, args: [], size: 0.04 };
    case "tool-wear-geometry": return { generate: generateErodingGeometry, color: state === "normal" ? "#a3a3a3" : color, rotSpeed: 0.1 * intensity, pulse, cameraZ: 6, args: [], size: 0.05 };
    case "supply-chain-flow": return { generate: generateFlowNetwork, color: state === "normal" ? "#3b82f6" : color, rotSpeed: 0.05 * intensity, pulse, cameraZ: 9, args: [], size: 0.03 };
    case "operator-approval-orb": return { generate: generateOrb, color: state === "normal" ? "#22c55e" : color, rotSpeed: 0.02 * intensity, pulse, cameraZ: 5, args: [], size: 0.02 };
    case "stuxnet-centrifuge": return { generate: generateCylinder, color: "#ff0000", rotSpeed: 4.0 * intensity, pulse: 0.8, cameraZ: 8, args: [], size: 0.06 };

    // Fallback URL Pathname Routing
    case "/": return { generate: generateGlobe, color, rotSpeed: 0.05 * intensity, pulse, cameraZ: 6, args: [], size: 0.02 };
    case "/roadmap": return { generate: generateHelix, color: state === "normal" ? "#ffb84d" : color, rotSpeed: 0.1 * intensity, pulse, cameraZ: 12, args: [], size: 0.03 };
    case "/rag": return { generate: generateNeural, color: state === "normal" ? "#9b6dff" : color, rotSpeed: 0.02 * intensity, pulse, cameraZ: 7, args: [], size: 0.03 };
    case "/simulator": return { generate: generateSpindle, color, rotSpeed: 0.4 * intensity, pulse, cameraZ: 8, args: [true], size: 0.04 };
    case "/ledger": return { generate: generateGrid, color: state === "normal" ? "#00e5a0" : color, rotSpeed: 0.05 * intensity, pulse, cameraZ: 9, args: [], size: 0.03 };
    case "/advisory": return { generate: generateOctahedron, color: state === "normal" ? "#e8f4ff" : color, rotSpeed: 0.1 * intensity, pulse, cameraZ: 7, args: [], size: 0.03 };
    case "/governance": return { generate: generateShield, color: state === "normal" ? "#00e5a0" : color, rotSpeed: 0.08 * intensity, pulse, cameraZ: 7, args: [], size: 0.02 };
    case "/architecture": return { generate: generateLattice, color: state === "normal" ? "#0099bb" : color, rotSpeed: 0.05 * intensity, pulse, cameraZ: 8, args: [], size: 0.03 };
    case "/kpi": return { generate: generateCylinder, color: state === "normal" ? "#ff4d7a" : color, rotSpeed: 0.2 * intensity, pulse, cameraZ: 10, args: [], size: 0.03 };
    case "/qa": return { generate: generateTorus, color: state === "normal" ? "#ffb84d" : color, rotSpeed: 0.15 * intensity, pulse, cameraZ: 8, args: [], size: 0.03 };

    default: return { generate: generateGlobe, color, rotSpeed: 0.05 * intensity, pulse, cameraZ: 6, args: [], size: 0.02 };
  }
}

function ParticleCore({ state, areaOrModel }: { state: WebGLSignalState, areaOrModel: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // 15000 particles for a GIGANTIC digital twin feel
  const particleCount = 15000;
  
  const config = useMemo(() => getTwinConfig(areaOrModel, state), [areaOrModel, state]);

  const geoData = useMemo(() => {
    // @ts-ignore
    return config.generate(particleCount, ...config.args);
  }, [config, particleCount]);

  const isAdvancedGeo = (geoData as any).positions !== undefined;
  const positions = isAdvancedGeo ? (geoData as any).positions : geoData;
  const colors = isAdvancedGeo ? (geoData as any).colors : null;

  // Color transition target
  const targetColor = useMemo(() => new THREE.Color(config.color), [config.color]);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  useFrame((stateObj) => {
    if (!pointsRef.current) return;
    const time = stateObj.clock.getElapsedTime();
    
    pointsRef.current.rotation.y = time * config.rotSpeed;
    
    // Pulse effect
    const scale = 1 + Math.sin(time * (state === "normal" ? 2 : 5)) * config.pulse;
    pointsRef.current.scale.set(scale, scale, scale);

    // Smooth color interpolation
    if (materialRef.current) {
      materialRef.current.color.lerp(targetColor, 0.05);
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        ref={materialRef}
        transparent
        vertexColors={!!colors}
        color={colors ? "#ffffff" : config.color}
        size={config.size}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function Points({ positions, colors, children, ...props }: any) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    if (colors) {
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
    return geo;
  }, [positions, colors]);

  return (
    <points geometry={geometry} {...props}>
      {children}
    </points>
  );
}

function MouseParallax({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    const targetX = (state.pointer.x * Math.PI) / 6;
    const targetY = (state.pointer.y * Math.PI) / 8;
    groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.05;
  });
  return <group ref={groupRef}>{children}</group>;
}

export default function DataCoreWebGL({ 
  modelOverride,
  signalState = "normal" 
}: { 
  modelOverride?: TwinModelId,
  signalState?: WebGLSignalState
}) {
  const pathname = usePathname();
  const areaOrModel = modelOverride || pathname || "/";
  const config = getTwinConfig(areaOrModel, signalState);

  // Massive scaling for global background
  return (
    <div className="fixed inset-0 z-0 pointer-events-none mix-blend-screen transition-opacity duration-1000">
      <Canvas camera={{ position: [0, 0, config.cameraZ], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <MouseParallax>
          <Float speed={signalState !== "normal" ? 3 : 1} rotationIntensity={signalState !== "normal" ? 1.5 : 0.5} floatIntensity={signalState !== "normal" ? 2 : 1}>
            <ParticleCore state={signalState} areaOrModel={areaOrModel} />
          </Float>
        </MouseParallax>
        <Stars radius={100} depth={50} count={3000} factor={6} saturation={0} fade speed={signalState !== "normal" ? 3 : 1} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={signalState !== "normal" ? 4 : 0.5} 
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={signalState !== "normal" ? 2.5 : 1.5} 
          />
          <Glitch
            delay={new THREE.Vector2(1.5, 3.5)} // min and max delay
            duration={new THREE.Vector2(0.1, 0.3)} // min and max duration
            strength={new THREE.Vector2(0.1, 0.4)} // min and max strength
            mode={GlitchMode.SPORADIC} // glitch mode
            active={signalState === "critical"} // turn on/off the effect
            ratio={0.85} // Threshold for strong glitches
          />
          <ChromaticAberration
            blendFunction={(signalState === "warning" || signalState === "critical") ? BlendFunction.NORMAL : BlendFunction.SKIP} // blend mode
            offset={new THREE.Vector2(0.002, 0.002)} // color offset
          />
        </EffectComposer>
      </Canvas>
      {/* Soft vignette to blend the edges without covering too much */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.5) 90%, black 100%)" }} />
    </div>
  );
}
