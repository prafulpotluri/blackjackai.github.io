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
      {/* Table surface - Larger oval */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[6.5, 64]} />
        <meshStandardMaterial
          color="#0d4d2a"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Table edge */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.5, 6.9, 64]} />
        <meshStandardMaterial
          color="#6b4423"
          roughness={0.5}
          metalness={0.2}
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
      
      {/* Lighting - Better illumination */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 10, 0]} intensity={0.8} castShadow />
      <pointLight position={[0, 4, 0]} intensity={0.5} />
      <spotLight
        position={[0, 6, -3]}
        angle={0.6}
        penumbra={0.5}
        intensity={0.7}
        target-position={[0, 0, -3]}
        castShadow
      />
      <spotLight
        position={[0, 6, 3]}
        angle={0.6}
        penumbra={0.5}
        intensity={0.7}
        target-position={[0, 0, 3]}
        castShadow
      />
    </>
  );
};
