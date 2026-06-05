"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { usePathname } from "next/navigation";

function generateSpindlePoints(count: number, area: string) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // If we are in the workbench (simulate), make it chaotic
    const ySpread = area === "/simulator" ? 6 : 4;
    const y = (Math.random() - 0.5) * ySpread; 
    
    let r = 1;
    if (area === "/simulator") {
      r = Math.random() * 2 + 0.5; // Wider, chaotic sphere
    } else {
      if (Math.abs(y) > 1.5) r = 0.5;
      else if (Math.abs(y) < 0.5) r = 1.2;
    }

    const theta = Math.random() * 2 * Math.PI;
    const radius = Math.random() * r; 

    points[i * 3] = radius * Math.cos(theta);
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = radius * Math.sin(theta);
  }
  return points;
}

function ParticleCore({ isCritical, area }: { isCritical?: boolean, area: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // 15000 particles for a GIGANTIC digital twin feel
  const particleCount = 15000;
  const positions = useMemo(() => generateSpindlePoints(particleCount, area), [particleCount, area]);

  // Color dynamic based on area and critical state
  const color = isCritical ? "#ef4444" : area === "/simulator" ? "#f59e0b" : "#00d4ff"; // Amber in simulator, cyan in overview

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Rotation speed based on area
    const rotSpeed = area === "/simulator" ? 0.4 : 0.05;
    pointsRef.current.rotation.y = time * rotSpeed;
    
    // Pulse effect
    const pulseFactor = area === "/simulator" ? 0.15 : 0.05;
    const scale = 1 + Math.sin(time * (area === "/simulator" ? 5 : 2)) * pulseFactor;
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={area === "/simulator" ? 0.04 : 0.02}
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

  // Massive scaling for global background
  return (
    <div className="fixed inset-0 z-0 pointer-events-none mix-blend-screen transition-opacity duration-1000">
      <Canvas camera={{ position: [0, 0, area === "/simulator" ? 8 : 6], fov: 60 }}>
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
