"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Generate points for a cylinder/spindle shape
function generateSpindlePoints(count: number) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = (Math.random() - 0.5) * 4; // Height from -2 to 2
    // Radius varies along the Y axis to simulate a spindle structure
    let r = 1;
    if (Math.abs(y) > 1.5) r = 0.5;
    else if (Math.abs(y) < 0.5) r = 1.2;

    const theta = Math.random() * 2 * Math.PI;
    const radius = Math.random() * r; // Fill the interior

    points[i * 3] = radius * Math.cos(theta);
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = radius * Math.sin(theta);
  }
  return points;
}

function ParticleCore({ isCritical }: { isCritical?: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // 5000 particles to represent the massive data flow
  const particleCount = 5000;
  const positions = useMemo(() => generateSpindlePoints(particleCount), [particleCount]);

  // Color changes to red/amber if critical
  const color = isCritical ? "#ef4444" : "#00d4ff"; // Cyan by default, red on critical

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Rotate the entire point cloud slowly
    pointsRef.current.rotation.y = time * 0.1;
    
    // Pulse effect
    const scale = 1 + Math.sin(time * 2) * 0.05;
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Custom wrapper for three.js points to handle buffer geometry simply
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

export default function DataCoreWebGL({ isCritical = false }: { isCritical?: boolean }) {
  return (
    <div className="absolute inset-0 z-0 opacity-90 mix-blend-screen pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
          <ParticleCore isCritical={isCritical} />
        </Float>
        <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={1} 
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}
