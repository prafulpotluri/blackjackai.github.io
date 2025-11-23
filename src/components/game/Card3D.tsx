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
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.02, 0.9]} />
        <meshStandardMaterial
          color={faceDown ? "#1e40af" : "#ffffff"}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {!faceDown && (
        <Html
          transform
          position={[0, 0.02, 0]}
          style={{
            width: '58px',
            height: '88px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            borderRadius: '4px',
            pointerEvents: 'none',
          }}
        >
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: SUIT_COLORS[card.suit],
            textAlign: 'center'
          }}>
            {card.rank}
            <br />
            {SUIT_SYMBOLS[card.suit]}
          </div>
        </Html>
      )}
    </group>
  );
};
