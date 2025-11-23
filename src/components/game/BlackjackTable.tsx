import { Card3D } from './Card3D';
import { AgentRobot } from './AgentRobot';
import { Hand } from '@/lib/blackjack/types';

interface BlackjackTableProps {
  playerHands: Hand[];
  dealerHand: Hand;
  gamePhase: string;
}

export const BlackjackTable = ({ playerHands, dealerHand, gamePhase }: BlackjackTableProps) => {
  return (
    <>
      {/* Table surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[4, 64]} />
        <meshStandardMaterial
          color="#1a5c3a"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Table edge */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 4.2, 64]} />
        <meshStandardMaterial
          color="#8b4513"
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>
      
      {/* Dealer's cards */}
      {dealerHand.cards.map((card, i) => (
        <Card3D
          key={`dealer-${i}`}
          card={card}
          position={[-0.4 + i * 0.7, 0.02, -1.5]}
          rotation={[0, 0, 0]}
          faceDown={gamePhase === 'playing' && i === 1}
        />
      ))}
      
      {/* Player's cards */}
      {playerHands.length > 0 && playerHands[0].cards.map((card, i) => (
        <Card3D
          key={`player-${i}`}
          card={card}
          position={[-0.4 + i * 0.7, 0.02, 1.5]}
          rotation={[0, 0, 0]}
        />
      ))}
      
      {/* Chip stacks */}
      {[...Array(3)].map((_, i) => (
        <group key={`chip-${i}`} position={[2.5 + i * 0.5, 0.05, 0]}>
          {[...Array(5)].map((_, j) => (
            <mesh key={j} position={[0, j * 0.02, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
              <meshStandardMaterial
                color={i === 0 ? "#ef4444" : i === 1 ? "#3b82f6" : "#22c55e"}
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Agent Robot */}
      <AgentRobot />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 5, 0]} intensity={0.8} castShadow />
      <spotLight
        position={[0, 4, -2]}
        angle={0.5}
        penumbra={0.5}
        intensity={0.5}
        castShadow
      />
    </>
  );
};
