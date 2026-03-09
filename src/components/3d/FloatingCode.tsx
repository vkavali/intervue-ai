"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import Scene from "./Scene";

function CodePanel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.3) * 0.1 - 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Main editor panel */}
        <RoundedBox args={[3.5, 2.2, 0.08]} radius={0.06} smoothness={4}>
          <meshStandardMaterial
            color="#111827"
            metalness={0.3}
            roughness={0.7}
          />
        </RoundedBox>

        {/* Screen glow */}
        <RoundedBox
          args={[3.3, 2.0, 0.02]}
          radius={0.04}
          smoothness={4}
          position={[0, 0, 0.05]}
        >
          <meshStandardMaterial
            color="#1e1b4b"
            emissive="#4c1d95"
            emissiveIntensity={0.3}
          />
        </RoundedBox>

        {/* Code lines simulation */}
        {[0.6, 0.35, 0.1, -0.15, -0.4, -0.65].map((y, i) => (
          <mesh key={i} position={[-0.4 + i * 0.1, y, 0.07]}>
            <planeGeometry args={[1.2 + Math.random() * 1.0, 0.06]} />
            <meshStandardMaterial
              color={
                ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#60a5fa"][i]
              }
              emissive={
                ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#60a5fa"][i]
              }
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}

        {/* Top bar (browser chrome) */}
        <mesh position={[0, 1.0, 0.06]}>
          <planeGeometry args={[3.3, 0.15]} />
          <meshStandardMaterial color="#030712" />
        </mesh>

        {/* Window dots */}
        {[-1.4, -1.3, -1.2].map((x, i) => (
          <mesh key={i} position={[x, 1.0, 0.07]}>
            <circleGeometry args={[0.03, 16]} />
            <meshStandardMaterial
              color={["#ef4444", "#eab308", "#22c55e"][i]}
              emissive={["#ef4444", "#eab308", "#22c55e"][i]}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}

        {/* Floating audit card */}
        <group position={[-2.0, -1.0, 0.5]} rotation={[0, 0.2, 0.05]}>
          <RoundedBox args={[1.4, 0.7, 0.05]} radius={0.04} smoothness={4}>
            <meshStandardMaterial
              color="#052e16"
              emissive="#166534"
              emissiveIntensity={0.2}
            />
          </RoundedBox>
          <mesh position={[0, 0, 0.04]}>
            <planeGeometry args={[0.8, 0.08]} />
            <meshStandardMaterial
              color="#4ade80"
              emissive="#4ade80"
              emissiveIntensity={0.6}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>

        {/* Floating AI level card */}
        <group position={[2.0, 1.0, 0.6]} rotation={[0, -0.15, -0.05]}>
          <RoundedBox args={[1.2, 0.5, 0.05]} radius={0.04} smoothness={4}>
            <meshStandardMaterial
              color="#1e1b4b"
              emissive="#7c3aed"
              emissiveIntensity={0.2}
            />
          </RoundedBox>
          {/* Level indicators */}
          {[-0.35, -0.175, 0, 0.175, 0.35].map((x, i) => (
            <mesh key={i} position={[x, -0.05, 0.04]}>
              <planeGeometry args={[0.12, 0.12]} />
              <meshStandardMaterial
                color={i === 2 ? "#3b82f6" : "#374151"}
                emissive={i === 2 ? "#3b82f6" : "#000000"}
                emissiveIntensity={i === 2 ? 0.8 : 0}
              />
            </mesh>
          ))}
        </group>
      </group>
    </Float>
  );
}

export default function FloatingCode() {
  return (
    <Scene className="w-full h-full" cameraPosition={[0, 0, 5]}>
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#a855f7" />
      <pointLight position={[5, -5, 5]} intensity={0.3} color="#3b82f6" />
      <CodePanel />
    </Scene>
  );
}
