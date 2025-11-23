import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

export const AgentRobot = () => {
  const groupRef = useRef<THREE.Group>(null);
  const wingLeftRef = useRef<THREE.Group>(null);
  const wingRightRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Gentle floating
    if (groupRef.current) {
      groupRef.current.position.y = 2.5 + Math.sin(t * 2) * 0.15;
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
    }
    
    // Wing flapping
    if (wingLeftRef.current && wingRightRef.current) {
      const flap = Math.sin(t * 4) * 0.3;
      wingLeftRef.current.rotation.z = -0.3 + flap;
      wingRightRef.current.rotation.z = 0.3 - flap;
    }
    
    // Halo rotation
    if (haloRef.current) {
      haloRef.current.rotation.z = t;
    }
  });
  
  return (
    <group ref={groupRef} position={[-3, 2.5, 2]}>
      {/* Halo */}
      <mesh ref={haloRef} position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <Torus args={[0.35, 0.04, 16, 32]}>
          <meshStandardMaterial
            color="#ffd700"
            emissive="#ffd700"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </Torus>
      </mesh>
      
      {/* Head */}
      <Sphere args={[0.4, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#e0e0e0"
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>
      
      {/* Eyes */}
      <Sphere args={[0.08, 16, 16]} position={[-0.12, 0.1, 0.35]}>
        <meshStandardMaterial
          color="#4a9eff"
          emissive="#4a9eff"
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Sphere args={[0.08, 16, 16]} position={[0.12, 0.1, 0.35]}>
        <meshStandardMaterial
          color="#4a9eff"
          emissive="#4a9eff"
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      {/* Smile */}
      <mesh position={[0, -0.05, 0.38]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 32, Math.PI]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, -0.6, 0]}>
        <capsuleGeometry args={[0.25, 0.4, 16, 32]} />
        <meshStandardMaterial
          color="#f0f0f0"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* Wings */}
      <group ref={wingLeftRef} position={[-0.3, -0.3, 0]} rotation={[0, 0, -0.3]}>
        <mesh>
          <boxGeometry args={[0.6, 0.02, 0.8]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            metalness={0.3}
            roughness={0.1}
          />
        </mesh>
        {/* Feather details */}
        {[0, 0.15, 0.3].map((offset, i) => (
          <mesh key={i} position={[offset, 0.01, 0]}>
            <boxGeometry args={[0.15, 0.01, 0.75]} />
            <meshStandardMaterial
              color="#f8f8f8"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
      
      <group ref={wingRightRef} position={[0.3, -0.3, 0]} rotation={[0, 0, 0.3]}>
        <mesh>
          <boxGeometry args={[0.6, 0.02, 0.8]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            metalness={0.3}
            roughness={0.1}
          />
        </mesh>
        {[0, -0.15, -0.3].map((offset, i) => (
          <mesh key={i} position={[offset, 0.01, 0]}>
            <boxGeometry args={[0.15, 0.01, 0.75]} />
            <meshStandardMaterial
              color="#f8f8f8"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
      
      {/* Glow effect */}
      <pointLight
        position={[0, 0, 0]}
        color="#ffd700"
        intensity={0.5}
        distance={2}
      />
    </group>
  );
};
