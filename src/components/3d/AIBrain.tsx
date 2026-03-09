"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import Scene from "./Scene";

function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const { nodePositions, linePositions, lineColors } = useMemo(() => {
    const nodePositions: [number, number, number][] = [];
    const linePositions: number[] = [];
    const lineColors: number[] = [];

    // Create nodes in layers (neural network shape)
    const layers = [4, 6, 8, 6, 4];
    const layerSpacing = 0.8;

    layers.forEach((count, layerIdx) => {
      const x = (layerIdx - (layers.length - 1) / 2) * layerSpacing;
      for (let i = 0; i < count; i++) {
        const y = (i - (count - 1) / 2) * 0.5;
        const z = (Math.random() - 0.5) * 0.3;
        nodePositions.push([x, y, z]);
      }
    });

    // Create connections between adjacent layers
    let offset = 0;
    for (let l = 0; l < layers.length - 1; l++) {
      const nextOffset = offset + layers[l];
      for (let i = 0; i < layers[l]; i++) {
        for (let j = 0; j < layers[l + 1]; j++) {
          if (Math.random() > 0.4) {
            const from = nodePositions[offset + i];
            const to = nodePositions[nextOffset + j];
            linePositions.push(from[0], from[1], from[2], to[0], to[1], to[2]);

            const t = Math.random();
            const color = new THREE.Color().lerpColors(
              new THREE.Color("#a855f7"),
              new THREE.Color("#06b6d4"),
              t
            );
            lineColors.push(color.r, color.g, color.b, color.r, color.g, color.b);
          }
        }
      }
      offset = nextOffset;
    }

    return {
      nodePositions,
      linePositions: new Float32Array(linePositions),
      lineColors: new Float32Array(lineColors),
    };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    groupRef.current.rotation.x =
      Math.cos(state.clock.elapsedTime * 0.15) * 0.1;

    // Pulse the connections
    if (linesRef.current) {
      const material = linesRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Connection lines */}
        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={linePositions.length / 3}
              array={linePositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={lineColors.length / 3}
              array={lineColors}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            vertexColors
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>

        {/* Nodes */}
        {nodePositions.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#a855f7"
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}

        {/* Central glow */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial
            color="#7c3aed"
            transparent
            opacity={0.05}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function AIBrain() {
  return (
    <Scene className="w-full h-full" cameraPosition={[0, 0, 4]}>
      <pointLight position={[3, 3, 3]} intensity={0.5} color="#a855f7" />
      <pointLight position={[-3, -3, 3]} intensity={0.3} color="#06b6d4" />
      <NeuralNetwork />
    </Scene>
  );
}
