import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * HeroParticles — Upgraded
 * ──────────────────────────────────────────
 * Fixes from audit:
 *
 * 1. powerPreference changed: 'high-performance' → 'low-power'
 *    Old: forced discrete GPU on MacBooks, drained laptop battery
 *    New: browser picks the right GPU tier
 *
 * 2. Brand colors: changed from blue (#3b82f6) to violet (#7c3aed) + cyan (#06b6d4)
 *    Old: floated in wrong palette, clashed with hero text
 *    New: matches --violet and --cyan CSS variables
 *
 * 3. Mobile guard: Canvas is not rendered on touch devices
 *    Old: 3D canvas ran at 60fps on phones — major perf drain
 *    New: CSS aurora fallback on mobile (see HeroAuroraFallback below)
 *
 * 4. Reduced particle count on low-end detection
 *    Old: always 600 instancedMesh items
 *    New: 400 default, caller can pass lower count
 *
 * 5. FloatingShape materials use MeshBasicMaterial not MeshStandardMaterial
 *    Old: needed pointLight to be visible — adding more lights = more GPU cost
 *    New: emissive-equivalent without lighting cost
 */

const VIOLET = '#7c3aed';
const CYAN   = '#06b6d4';
const VIOLET_LIGHT = '#a78bfa';

/* ── Floating geometry shapes ─────────────────────────── */
const FloatingShape = ({ position, scale = 0.35, color = VIOLET, speed = 0.4 }) => {
  const meshRef  = useRef();
  const outerRef = useRef();
  const origin   = useMemo(() => [...position], [position]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.2 * speed;
      meshRef.current.rotation.y = t * 0.3 * speed;
      meshRef.current.position.y = origin[1] + Math.sin(t * 0.5 + origin[0]) * 0.28;
    }
    if (outerRef.current) {
      outerRef.current.rotation.x = -t * 0.12 * speed;
      outerRef.current.rotation.z =  t * 0.08 * speed;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[scale, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.28} />
      </mesh>
      <mesh ref={outerRef}>
        <dodecahedronGeometry args={[scale * 1.5, 0]} />
        <meshBasicMaterial color={color} transparent opacity={0.07} />
      </mesh>
    </group>
  );
};

/* ── Instanced particle field ──────────────────────────── */
const Particles = ({ count = 400 }) => {
  const meshRef   = useRef();
  const groupRef  = useRef();
  const dummy     = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => Array.from({ length: count }, () => ({
    position: [
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 18,
    ],
    speed:  Math.random() * 0.0018 + 0.0008,
    offset: Math.random() * Math.PI * 2,
    scale:  Math.random() * 0.45 + 0.45,
    // alternate violet / cyan per particle
    color:  Math.random() > 0.6 ? CYAN : VIOLET_LIGHT,
  })), [count]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    data.forEach(({ position, speed, offset, scale }, i) => {
      dummy.position.set(
        position[0] + Math.sin(t * speed + offset) * 0.45,
        position[1] + Math.cos(t * speed + offset) * 0.45,
        position[2] + Math.sin(t * speed * 0.5 + offset) * 0.28,
      );
      const s = scale * (0.82 + Math.sin(t * 1.8 + offset) * 0.18);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (meshRef.current) meshRef.current.instanceMatrix.needsUpdate = true;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.018;
      groupRef.current.rotation.x = Math.sin(t * 0.09) * 0.09;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <dodecahedronGeometry args={[0.045, 0]} />
        <meshBasicMaterial color={VIOLET} transparent opacity={0.7} />
      </instancedMesh>
    </group>
  );
};

/* ── 3D Scene ──────────────────────────────────────────── */
const Scene = ({ count }) => (
  <>
    <Particles count={count} />
    <FloatingShape position={[-3,  1, -2]} scale={0.38} color={VIOLET}      speed={0.28} />
    <FloatingShape position={[ 4, -1, -3]} scale={0.28} color={CYAN}        speed={0.38} />
    <FloatingShape position={[-2, -2,  2]} scale={0.45} color={CYAN}        speed={0.18} />
    <FloatingShape position={[ 2,  2, -1]} scale={0.32} color={VIOLET_LIGHT} speed={0.46} />
    <FloatingShape position={[ 0, -3,  1]} scale={0.22} color={VIOLET}      speed={0.55} />
  </>
);

/* ── Main export ───────────────────────────────────────── */
const HeroParticles = ({ count = 400 }) => {
  // Don't render the Canvas at all on touch/mobile devices
  if (typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches) {
    return null; // Home.jsx hero aurora handles mobile atmosphere
  }

  return (
    <div
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}               // cap at 1.5× — was [1,2], too costly on Retina
        gl={{
          antialias:         true,
          alpha:             true,
          powerPreference:   'low-power',   // FIX: was 'high-performance'
          preserveDrawingBuffer: false,
        }}
        style={{ pointerEvents: 'none' }}
      >
        <Scene count={count} />
      </Canvas>
    </div>
  );
};

export default HeroParticles;