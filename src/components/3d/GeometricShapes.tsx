"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import Scene from "./Scene";

function Shapes() {
  const group1 = useRef<THREE.Mesh>(null);
  const group2 = useRef<THREE.Mesh>(null);
  const group3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group1.current) {
      group1.current.rotation.x = t * 0.3;
      group1.current.rotation.z = t * 0.2;
    }
    if (group2.current) {
      group2.current.rotation.y = t * 0.25;
      group2.current.rotation.x = t * 0.15;
    }
    if (group3.current) {
      group3.current.rotation.z = t * 0.35;
      group3.current.rotation.y = t * 0.2;
    }
  });

  return (
    <>
      {/* Icosahedron - purple */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh ref={group1} position={[-2, 0.5, 0]}>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color="#7c3aed"
            emissive="#7c3aed"
            emissiveIntensity={0.3}
            wireframe
            transparent
            opacity={0.6}
          />
        </mesh>
      </Float>

      {/* Torus knot - blue */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh ref={group2} position={[2, -0.5, -1]}>
          <torusKnotGeometry args={[0.35, 0.1, 64, 8]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.3}
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>
      </Float>

      {/* Octahedron - cyan */}
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.7}>
        <mesh ref={group3} position={[0, -1, 0.5]}>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.3}
            wireframe
            transparent
            opacity={0.6}
          />
        </mesh>
      </Float>
    </>
  );
}

export default function GeometricShapes() {
  return (
    <Scene className="w-full h-full" cameraPosition={[0, 0, 5]}>
      <pointLight position={[3, 3, 3]} intensity={0.3} color="#a855f7" />
      <pointLight position={[-3, -3, 3]} intensity={0.3} color="#06b6d4" />
      <Shapes />
    </Scene>
  );
}
