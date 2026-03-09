"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import Scene from "./Scene";

interface BarData {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  x: number;
}

function AnimatedBar({
  data,
  animProgress,
}: {
  data: BarData;
  animProgress: number;
}) {
  const height = (data.value / data.maxValue) * 2.5 * animProgress;

  return (
    <group position={[data.x, -1.2, 0]}>
      {/* Bar */}
      <RoundedBox
        args={[0.5, Math.max(height, 0.01), 0.3]}
        radius={0.04}
        smoothness={4}
        position={[0, height / 2, 0]}
      >
        <meshStandardMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.85}
        />
      </RoundedBox>

      {/* Base */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[0.55, 0.04, 0.35]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
    </group>
  );
}

function Chart() {
  const groupRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(1), 500);
    return () => clearTimeout(timer);
  }, []);

  const animProgress = useRef(0);

  useFrame((state, delta) => {
    if (animProgress.current < progress) {
      animProgress.current = Math.min(
        animProgress.current + delta * 0.8,
        progress
      );
    }

    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.15 - 0.3;
    }
  });

  const bars: BarData[] = [
    { label: "Problems", value: 4000, maxValue: 4500, color: "#a855f7", x: -1.8 },
    { label: "Languages", value: 7, maxValue: 4500, color: "#3b82f6", x: -0.9 },
    { label: "Patterns", value: 15, maxValue: 4500, color: "#06b6d4", x: 0 },
    { label: "Easy", value: 1400, maxValue: 4500, color: "#22c55e", x: 0.9 },
    { label: "Medium", value: 1800, maxValue: 4500, color: "#eab308", x: 1.8 },
  ];

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef}>
        {/* Platform base */}
        <mesh position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5, 2]} />
          <meshStandardMaterial
            color="#1f2937"
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Bars */}
        {bars.map((bar) => (
          <AnimatedBar
            key={bar.label}
            data={bar}
            animProgress={animProgress.current}
          />
        ))}

        {/* Back panel */}
        <mesh position={[0, 0.5, -0.3]}>
          <planeGeometry args={[5, 4]} />
          <meshStandardMaterial
            color="#111827"
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Grid lines on back panel */}
        {[-0.8, 0, 0.8, 1.6].map((y, i) => (
          <mesh key={i} position={[0, y - 0.3, -0.28]}>
            <planeGeometry args={[4.8, 0.005]} />
            <meshStandardMaterial
              color="#374151"
              transparent
              opacity={0.4}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

export default function PracticeViz() {
  return (
    <Scene className="w-full h-full" cameraPosition={[0, 0.5, 5]}>
      <pointLight position={[3, 5, 5]} intensity={0.5} color="#a855f7" />
      <pointLight position={[-3, 3, 5]} intensity={0.3} color="#06b6d4" />
      <Chart />
    </Scene>
  );
}
