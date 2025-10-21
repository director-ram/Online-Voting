import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 3D Background with 120 FPS support (actual FPS depends on monitor refresh rate)
// Modern displays: 60Hz = 60 FPS, 120Hz = 120 FPS, 144Hz = 144 FPS
// The animation will run as fast as the browser's requestAnimationFrame allows

// Animated particles that follow mouse (subtle version)
function Particles({ count = 300, mousePosition }) {
  const mesh = useRef();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 10 + Math.random() * 30;
      const speed = 0.001 + Math.random() / 500;
      const xFactor = -20 + Math.random() * 40;
      const yFactor = -20 + Math.random() * 40;
      const zFactor = -20 + Math.random() * 40;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;

      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 20;
      const b = Math.sin(t) + Math.cos(t * 2) / 20;
      const s = 0.3 + Math.cos(t) * 0.2;

      particle.mx += (mousePosition.x - particle.mx) * 0.005;
      particle.my += (mousePosition.y * -1 - particle.my) * 0.005;

      dummy.position.set(
        (particle.mx / 15) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 20,
        (particle.my / 15) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 20,
        (particle.my / 15) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 20
      );

      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 2, s * 2, s * 2);
      dummy.updateMatrix();

      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#6b95e8" transparent opacity={0.6} />
      </instancedMesh>
    </>
  );
}

// Floating orb that distorts with mouse movement (subtle)
function FloatingOrb({ position, mousePosition }) {
  const mesh = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.sin(t / 6) / 4;
    mesh.current.rotation.y = Math.sin(t / 4) / 4;
    mesh.current.position.y = position[1] + Math.sin(t * 0.5) * 0.3;
    
    // React to mouse movement (gentler)
    mesh.current.position.x = position[0] + mousePosition.x * 0.2;
    mesh.current.position.z = position[2] + mousePosition.y * 0.2;
  });

  return (
    <Sphere ref={mesh} args={[0.8, 64, 64]} position={position}>
      <MeshDistortMaterial
        color="#9b7de8"
        attach="material"
        distort={0.2}
        speed={1}
        roughness={0.3}
        metalness={0.6}
        transparent
        opacity={0.7}
      />
    </Sphere>
  );
}

// Animated gradient sphere (subtle)
function GradientSphere({ position, mousePosition }) {
  const mesh = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = t * 0.1;
    mesh.current.rotation.y = t * 0.15;
    
    // Subtle movement based on mouse
    mesh.current.position.x = position[0] + Math.sin(mousePosition.x * 1.5) * 0.15;
    mesh.current.position.z = position[2] + Math.cos(mousePosition.y * 1.5) * 0.15;
  });

  return (
    <Sphere ref={mesh} args={[1, 48, 48]} position={position}>
      <MeshDistortMaterial
        color="#d896e8"
        attach="material"
        distort={0.15}
        speed={0.8}
        roughness={0.2}
        metalness={0.7}
        transparent
        opacity={0.5}
      />
    </Sphere>
  );
}

// Rotating rings (subtle)
function RotatingRings({ mousePosition }) {
  const group = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.x = t * 0.1 + mousePosition.y * 0.2;
    group.current.rotation.y = t * 0.15 + mousePosition.x * 0.2;
  });

  return (
    <group ref={group}>
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[2.5, 0.05, 16, 100]} />
        <meshStandardMaterial color="#7ec4b3" metalness={0.6} roughness={0.3} transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.05, 16, 100]} />
        <meshStandardMaterial color="#7ea3e6" metalness={0.6} roughness={0.3} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// Main 3D Scene (subtle and elegant)
function Scene({ mousePosition }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} color="#9b7de8" intensity={0.3} />
      <pointLight position={[0, 5, 5]} color="#d896e8" intensity={0.4} />
      
      <Particles count={300} mousePosition={mousePosition} />
      <FloatingOrb position={[-3, 0, -8]} mousePosition={mousePosition} />
      <GradientSphere position={[3, 0, -8]} mousePosition={mousePosition} />
      <RotatingRings mousePosition={mousePosition} />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </>
  );
}

// Main component
export default function ThreeBackground() {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    setMousePosition({
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: (event.clientY / window.innerHeight) * 2 - 1,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #e8a5f0 100%)',
      }}
      onMouseMove={handleMouseMove}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        frameloop="always"
        performance={{ min: 0.5 }}
      >
        <Scene mousePosition={mousePosition} />
      </Canvas>
      
      {/* Subtle gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
