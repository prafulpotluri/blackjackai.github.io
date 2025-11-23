import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerAvatarProps {
  position: [number, number, number];
  isDealer?: boolean;
  isActive?: boolean;
}

export const PlayerAvatar = ({ position, isDealer = false, isActive = false }: PlayerAvatarProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && isActive) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.3, 8, 16]} />
        <meshStandardMaterial color={isDealer ? "#1a1a1a" : "#3b82f6"} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.05, 0.78, 0.12]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.05, 0.78, 0.12]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Hat for dealer */}
      {isDealer && (
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.12, 0.1, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      )}

      {/* Active indicator */}
      {isActive && (
        <mesh position={[0, 1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.25, 32]} />
          <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};
