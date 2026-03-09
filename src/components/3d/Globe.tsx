"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Scene from "./Scene";

function WireframeGlobe() {
  const globeRef = useRef<THREE.Group>(null);
  const arcsRef = useRef<THREE.Group>(null);

  // Generate connection arcs between random points on the sphere
  const arcs = useMemo(() => {
    const arcs: { curve: THREE.CubicBezierCurve3; color: THREE.Color }[] = [];
    const radius = 1.5;

    for (let i = 0; i < 8; i++) {
      const phi1 = Math.random() * Math.PI;
      const theta1 = Math.random() * Math.PI * 2;
      const phi2 = Math.random() * Math.PI;
      const theta2 = Math.random() * Math.PI * 2;

      const start = new THREE.Vector3(
        radius * Math.sin(phi1) * Math.cos(theta1),
        radius * Math.cos(phi1),
        radius * Math.sin(phi1) * Math.sin(theta1)
      );
      const end = new THREE.Vector3(
        radius * Math.sin(phi2) * Math.cos(theta2),
        radius * Math.cos(phi2),
        radius * Math.sin(phi2) * Math.sin(theta2)
      );

      const mid = start.clone().add(end).multiplyScalar(0.5);
      const height = start.distanceTo(end) * 0.5;
      mid.normalize().multiplyScalar(radius + height);

      const ctrl1 = start.clone().lerp(mid, 0.33);
      const ctrl2 = end.clone().lerp(mid, 0.33);

      const t = Math.random();
      const color = new THREE.Color().lerpColors(
        new THREE.Color("#a855f7"),
        new THREE.Color("#06b6d4"),
        t
      );

      arcs.push({
        curve: new THREE.CubicBezierCurve3(start, ctrl1, ctrl2, end),
        color,
      });
    }
    return arcs;
  }, []);

  // Dots on the globe surface
  const dots = useMemo(() => {
    const points: [number, number, number][] = [];
    const radius = 1.52;

    for (let i = 0; i < 60; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      points.push([
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
      ]);
    }
    return points;
  }, []);

  useFrame((state) => {
    if (!globeRef.current) return;
    globeRef.current.rotation.y = state.clock.elapsedTime * 0.08;
  });

  return (
    <group ref={globeRef}>
      {/* Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshStandardMaterial
          color="#1e1b4b"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[1.45, 16, 16]} />
        <meshStandardMaterial
          color="#7c3aed"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Surface dots */}
      {dots.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#a78bfa"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Connection arcs */}
      <group ref={arcsRef}>
        {arcs.map((arc, i) => {
          const points = arc.curve.getPoints(32);
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          return (
            <line key={i}>
              <primitive object={geometry} attach="geometry" />
              <lineBasicMaterial
                color={arc.color}
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
              />
            </line>
          );
        })}
      </group>

      {/* Arc endpoint glows */}
      {arcs.map((arc, i) => {
        const start = arc.curve.getPoint(0);
        const end = arc.curve.getPoint(1);
        return (
          <group key={`glow-${i}`}>
            <mesh position={[start.x, start.y, start.z]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial
                color={arc.color}
                emissive={arc.color}
                emissiveIntensity={1}
              />
            </mesh>
            <mesh position={[end.x, end.y, end.z]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial
                color={arc.color}
                emissive={arc.color}
                emissiveIntensity={1}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function Globe() {
  return (
    <Scene className="w-full h-full" cameraPosition={[0, 0, 4.5]}>
      <pointLight position={[5, 5, 5]} intensity={0.4} color="#a855f7" />
      <pointLight position={[-5, -5, 5]} intensity={0.3} color="#06b6d4" />
      <WireframeGlobe />
    </Scene>
  );
}
