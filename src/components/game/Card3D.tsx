import { Card } from '@/lib/blackjack/types';
import { Html } from '@react-three/drei';

interface Card3DProps {
  card: Card;
  position: [number, number, number];
  rotation?: [number, number, number];
  faceDown?: boolean;
}

const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const SUIT_COLORS = {
  hearts: '#ef4444',
  diamonds: '#ef4444',
  clubs: '#1f2937',
  spades: '#1f2937'
};

export const Card3D = ({ card, position, rotation = [0, 0, 0], faceDown = false }: Card3DProps) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Card base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.03, 0.8]} />
        <meshStandardMaterial
          color={faceDown ? "#1e3a8a" : "#ffffff"}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Card back pattern */}
      {faceDown && (
        <mesh position={[0, 0.016, 0]}>
          <planeGeometry args={[0.5, 0.75]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
      )}
      
      {/* Card face */}
      {!faceDown && (
        <Html
          transform
          position={[0, 0.02, 0]}
          style={{
            width: '52px',
            height: '76px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'white',
            borderRadius: '3px',
            padding: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            border: '1px solid #e5e7eb'
          }}
        >
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: SUIT_COLORS[card.suit],
            lineHeight: '1'
          }}>
            {card.rank}{SUIT_SYMBOLS[card.suit]}
          </div>
          <div style={{ 
            fontSize: '28px', 
            color: SUIT_COLORS[card.suit],
          }}>
            {SUIT_SYMBOLS[card.suit]}
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: SUIT_COLORS[card.suit],
            transform: 'rotate(180deg)',
            lineHeight: '1'
          }}>
            {card.rank}{SUIT_SYMBOLS[card.suit]}
          </div>
        </Html>
      )}
    </group>
  );
};
