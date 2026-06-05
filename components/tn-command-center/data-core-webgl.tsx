"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float, PointMaterial } from "@react-three/drei";
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
  generateTorus
} from "./webgl-geometries";

function getTwinConfig(area: string, isCritical: boolean) {
  if (isCritical) return { generate: generateSpindle, color: "#ef4444", rotSpeed: 0.8, pulse: 0.2, cameraZ: 8, args: [true], size: 0.04 };
  switch(area) {
    case "/": return { generate: generateGlobe, color: "#00d4ff", rotSpeed: 0.05, pulse: 0.02, cameraZ: 6, args: [], size: 0.02 };
    case "/roadmap": return { generate: generateHelix, color: "#ffb84d", rotSpeed: 0.1, pulse: 0.05, cameraZ: 12, args: [], size: 0.03 };
    case "/rag": return { generate: generateNeural, color: "#9b6dff", rotSpeed: 0.02, pulse: 0.1, cameraZ: 7, args: [], size: 0.03 };
    case "/simulator": return { generate: generateSpindle, color: "#f59e0b", rotSpeed: 0.4, pulse: 0.15, cameraZ: 8, args: [true], size: 0.04 };
    case "/ledger": return { generate: generateGrid, color: "#00e5a0", rotSpeed: 0.05, pulse: 0.02, cameraZ: 9, args: [], size: 0.03 };
    case "/advisory": return { generate: generateOctahedron, color: "#e8f4ff", rotSpeed: 0.1, pulse: 0.08, cameraZ: 7, args: [], size: 0.03 };
    case "/governance": return { generate: generateShield, color: "#00e5a0", rotSpeed: 0.08, pulse: 0.04, cameraZ: 7, args: [], size: 0.02 };
    case "/architecture": return { generate: generateLattice, color: "#0099bb", rotSpeed: 0.05, pulse: 0.03, cameraZ: 8, args: [], size: 0.03 };
    case "/kpi": return { generate: generateCylinder, color: "#ff4d7a", rotSpeed: 0.2, pulse: 0.1, cameraZ: 10, args: [], size: 0.03 };
    case "/qa": return { generate: generateTorus, color: "#ffb84d", rotSpeed: 0.15, pulse: 0.05, cameraZ: 8, args: [], size: 0.03 };
    default: return { generate: generateGlobe, color: "#00d4ff", rotSpeed: 0.05, pulse: 0.02, cameraZ: 6, args: [], size: 0.02 };
  }
}

function ParticleCore({ isCritical, area }: { isCritical?: boolean, area: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // 15000 particles for a GIGANTIC digital twin feel
  const particleCount = 15000;
  
  const config = useMemo(() => getTwinConfig(area, !!isCritical), [area, isCritical]);

  const positions = useMemo(() => {
    // @ts-ignore
    return config.generate(particleCount, ...config.args);
  }, [config, particleCount]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    pointsRef.current.rotation.y = time * config.rotSpeed;
    
    // Pulse effect
    const scale = 1 + Math.sin(time * (area === "/simulator" ? 5 : 2)) * config.pulse;
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={config.color}
        size={config.size}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function Points({ positions, children, ...props }: any) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

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
    // Smooth interpolation (spring-like parallax)
    groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.05;
  });
  return <group ref={groupRef}>{children}</group>;
}

export default function DataCoreWebGL({ isCritical = false }: { isCritical?: boolean }) {
  const pathname = usePathname();
  const area = pathname || "/";
  const config = getTwinConfig(area, !!isCritical);

  // Massive scaling for global background
  return (
    <div className="fixed inset-0 z-0 pointer-events-none mix-blend-screen transition-opacity duration-1000">
      <Canvas camera={{ position: [0, 0, config.cameraZ], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <MouseParallax>
          <Float speed={area === "/simulator" ? 3 : 1} rotationIntensity={area === "/simulator" ? 1.5 : 0.5} floatIntensity={area === "/simulator" ? 2 : 1}>
            <ParticleCore isCritical={isCritical} area={area} />
          </Float>
        </MouseParallax>
        <Stars radius={100} depth={50} count={3000} factor={6} saturation={0} fade speed={area === "/simulator" ? 3 : 1} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={area === "/simulator" ? 4 : 0.5} 
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      {/* Soft vignette to blend the edges without covering too much */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.5) 90%, black 100%)" }} />
    </div>
  );
}
