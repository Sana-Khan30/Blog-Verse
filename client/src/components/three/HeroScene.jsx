import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// ─── Optimized Particles ─────────────────────────────────────────────────────
function Particles({ count = 800 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, [count]);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.0002;
      ref.current.rotation.y += 0.0003;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8b5cf6"
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.5}
      />
    </Points>
  );
}

// ─── Orbiting spheres (optimized) ───────────────────────────────────────────
function OrbitingSphere({ radius = 8, speed = 0.3, color = '#8b5cf6', size = 0.2 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed;
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = Math.sin(t * 0.5) * 2;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        roughness={0.4}
        metalness={0.6}
      />
    </mesh>
  );
}

// ─── Central glowing orb ─────────────────────────────────────────────────────
function CentralOrb() {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.2, 24, 24]} />
      <meshStandardMaterial
        color="#8b5cf6"
        emissive="#6366f1"
        emissiveIntensity={0.5}
        roughness={0.1}
        metalness={0.9}
        transparent
        opacity={0.75}
      />
    </mesh>
  );
}

// ─── Main HeroScene (performance-optimized) ───────────────────────────────────
const HeroScene = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 0.3 }}
      className="absolute inset-0 z-0 overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 0, 18], fov: 55 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'low-power',
        }}
        dpr={[1, 1.5]}
        style={{ pointerEvents: 'none' }}
      >
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#8b5cf6" />
        <pointLight position={[-8, -8, -8]} intensity={0.4} color="#06b6d4" />

        {/* Particles — most expensive, reduced count */}
        <Particles count={800} />

        {/* Central orb */}
        <CentralOrb />

        {/* Reduced orbiting spheres */}
        <OrbitingSphere radius={7} speed={0.35} color="#8b5cf6" size={0.2} />
        <OrbitingSphere radius={9} speed={0.2} color="#06b6d4" size={0.15} />
      </Canvas>
    </motion.div>
  );
};

export default HeroScene;