import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Particles = ({ count = 800 }) => {
  const mesh = useRef();
  const lightMesh = useRef();

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
      ],
      speed: Math.random() * 0.002 + 0.001,
      offset: Math.random() * Math.PI * 2,
      scale: Math.random() * 0.5 + 0.5,
    }));
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    particles.forEach((particle, i) => {
      const { position, speed, offset, scale } = particle;

      // Floating movement
      dummy.position.set(
        position[0] + Math.sin(t * speed + offset) * 0.5,
        position[1] + Math.cos(t * speed + offset) * 0.5,
        position[2] + Math.sin(t * speed * 0.5 + offset) * 0.3
      );

      // Pulse scale
      const s = scale * (0.8 + Math.sin(t * 2 + offset) * 0.2);
      dummy.scale.set(s, s, s);

      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });

    mesh.current.instanceMatrix.needsUpdate = true;

    // Slowly rotate the entire particle system
    if (lightMesh.current) {
      lightMesh.current.rotation.y = t * 0.02;
      lightMesh.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
  });

  return (
    <group ref={lightMesh}>
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <dodecahedronGeometry args={[0.05, 0]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </instancedMesh>
    </group>
  );
};

const FloatingShape = ({ position = [0, 0, 0], scale = 1, color = '#8b5cf6', speed = 0.5 }) => {
  const meshRef = useRef();
  const outerRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.2 * speed;
      meshRef.current.rotation.y = t * 0.3 * speed;
      meshRef.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.3;
    }

    if (outerRef.current) {
      outerRef.current.rotation.x = -t * 0.15 * speed;
      outerRef.current.rotation.z = t * 0.1 * speed;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[scale, 1]} />
        <meshStandardMaterial
          color={color}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
      <mesh ref={outerRef}>
        <dodecahedronGeometry args={[scale * 1.5, 0]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[0, 0, 10]} intensity={0.8} color="#06b6d4" />

      <Particles count={600} />

      <FloatingShape position={[-3, 1, -2]} scale={0.4} color="#3b82f6" speed={0.3} />
      <FloatingShape position={[4, -1, -3]} scale={0.3} color="#8b5cf6" speed={0.4} />
      <FloatingShape position={[-2, -2, 2]} scale={0.5} color="#06b6d4" speed={0.2} />
      <FloatingShape position={[2, 2, -1]} scale={0.35} color="#ec4899" speed={0.5} />
    </>
  );
};

const HeroParticles = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default HeroParticles;