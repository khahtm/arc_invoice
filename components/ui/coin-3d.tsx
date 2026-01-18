'use client';

import React, { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useTexture, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const USDC_LOGO_URL = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png';

function CoinMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const texture = useTexture(USDC_LOGO_URL);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      if (hovered) {
        meshRef.current.rotation.y += delta * 1.5;
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh
        ref={meshRef}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <cylinderGeometry args={[2.5, 2.5, 0.3, 64]} />
        <meshStandardMaterial
          attach="material-0"
          color="#111111"
          metalness={0.9}
          roughness={0.15}
        />
        <meshStandardMaterial
          attach="material-1"
          color="#ffffff"
          metalness={0.4}
          roughness={0.3}
          map={texture}
        />
        <meshStandardMaterial
          attach="material-2"
          color="#ffffff"
          metalness={0.4}
          roughness={0.3}
          map={texture}
        />
      </mesh>
    </Float>
  );
}

export function Coin3DScene({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        <Suspense fallback={null}>
          <CoinMesh />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
