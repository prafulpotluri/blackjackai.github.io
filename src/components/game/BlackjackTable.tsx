import { Card3D } from './Card3D';
import { AgentRobot } from './AgentRobot';
import { PlayerAvatar } from './PlayerAvatar';
import { Hand } from '@/lib/blackjack/types';
import { Html } from '@react-three/drei';

interface BlackjackTableProps {
  playerHands: Hand[];
  dealerHand: Hand;
  gamePhase: string;
}

export const BlackjackTable = ({ playerHands, dealerHand, gamePhase }: BlackjackTableProps) => {
  return (
    <>
      {/* Premium felt surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[7, 64]} />
        <meshStandardMaterial
          color="#1565c0"
          roughness={0.9}
          metalness={0.0}
          envMapIntensity={0.3}
        />
      </mesh>
      
      {/* Luxury wood rail */}
      <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <ringGeometry args={[7, 7.5, 64]} />
        <meshStandardMaterial
          color="#4a2c1a"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      
      {/* Inner gold trim */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.95, 7.05, 64]} />
        <meshStandardMaterial
          color="#d4af37"
          roughness={0.2}
          metalness={0.8}
          emissive="#d4af37"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Dealer position at top */}
      <PlayerAvatar position={[0, 0.01, -3.5]} isDealer={true} />
      <Html position={[0, 0.01, -4.2]} center>
        <div style={{ 
          color: '#fbbf24', 
          fontSize: '14px', 
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
        }}>
          DEALER
          {dealerHand.cards.length > 0 && gamePhase !== 'betting' && (
            <div style={{ fontSize: '12px', color: '#fff', marginTop: '4px' }}>
              {gamePhase === 'playing' ? '?' : dealerHand.value}
            </div>
          )}
        </div>
      </Html>
      
      {/* Dealer's cards */}
      {dealerHand.cards.map((card, i) => (
        <Card3D
          key={`dealer-${i}`}
          card={card}
          position={[-0.5 + i * 0.65, 0.02, -2.5]}
          rotation={[0, 0, 0]}
          faceDown={gamePhase === 'playing' && i === 1}
        />
      ))}

      {/* Player 1 - Left side */}
      <PlayerAvatar position={[-2.5, 0.01, 2]} />
      <Html position={[-2.5, 0.01, 2.7]} center>
        <div style={{ 
          color: '#94a3b8', 
          fontSize: '12px', 
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          SEAT 1
        </div>
      </Html>

      {/* YOU - Center bottom */}
      <PlayerAvatar position={[0, 0.01, 3]} isActive={gamePhase === 'playing'} />
      <Html position={[0, 0.01, 3.8]} center>
        <div style={{ 
          color: '#3b82f6', 
          fontSize: '14px', 
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: gamePhase === 'playing' ? '0 0 10px rgba(59, 130, 246, 0.8)' : 'none'
        }}>
          YOU
          {playerHands[0]?.cards.length > 0 && (
            <div style={{ fontSize: '12px', color: '#fff', marginTop: '4px' }}>
              {playerHands[0].value} {playerHands[0].isSoft && '(soft)'}
            </div>
          )}
        </div>
      </Html>
      
      {/* Player's cards */}
      {playerHands.length > 0 && playerHands[0].cards.map((card, i) => (
        <Card3D
          key={`player-${i}`}
          card={card}
          position={[-0.5 + i * 0.65, 0.02, 2]}
          rotation={[0, 0, 0]}
        />
      ))}

      {/* Player 2 - Right side */}
      <PlayerAvatar position={[2.5, 0.01, 2]} />
      <Html position={[2.5, 0.01, 2.7]} center>
        <div style={{ 
          color: '#94a3b8', 
          fontSize: '12px', 
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          SEAT 2
        </div>
      </Html>
      
      {/* Betting circle */}
      <mesh position={[0, 0.01, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.45, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
      </mesh>
      
      {/* Agent Robot */}
      <AgentRobot />
      
      {/* Premium casino lighting */}
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight position={[0, 15, 0]} intensity={1.2} castShadow color="#ffffff" />
      <pointLight position={[0, 5, 0]} intensity={1} color="#fff5e1" />
      <spotLight
        position={[0, 8, -4]}
        angle={0.7}
        penumbra={0.6}
        intensity={1.5}
        target-position={[0, 0, -3]}
        castShadow
        color="#ffffff"
      />
      <spotLight
        position={[0, 8, 4]}
        angle={0.7}
        penumbra={0.6}
        intensity={1.5}
        target-position={[0, 0, 3]}
        castShadow
        color="#ffffff"
      />
      <spotLight
        position={[-5, 6, 0]}
        angle={0.5}
        penumbra={0.7}
        intensity={0.8}
        target-position={[-2.5, 0, 2]}
        color="#d4af37"
      />
      <spotLight
        position={[5, 6, 0]}
        angle={0.5}
        penumbra={0.7}
        intensity={0.8}
        target-position={[2.5, 0, 2]}
        color="#d4af37"
      />
    </>
  );
};
