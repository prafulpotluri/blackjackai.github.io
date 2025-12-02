import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { BlackjackTable } from '@/components/game/BlackjackTable';
import { GameControls } from '@/components/game/GameControls';
import { BettingPanel } from '@/components/game/BettingPanel';
import { AgentPanel } from '@/components/game/AgentPanel';
import { CardCountingPanel } from '@/components/game/CardCountingPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBlackjackGame } from '@/hooks/useBlackjackGame';
import { useRef } from 'react';
import * as THREE from 'three';

const CameraController = ({ gamePhase }: { gamePhase: string }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (!cameraRef.current) return;
    
    let targetPosition: THREE.Vector3;
    let targetLookAt: THREE.Vector3;

    if (gamePhase === 'playing') {
      // Zoom to player's cards
      targetPosition = new THREE.Vector3(0, 5, 5.5);
      targetLookAt = new THREE.Vector3(0, 0, 2.5);
    } else {
      // Overview of entire table
      targetPosition = new THREE.Vector3(0, 10, 0.5);
      targetLookAt = new THREE.Vector3(0, 0, 0);
    }

    // Smooth camera transition
    cameraRef.current.position.lerp(targetPosition, 0.05);
    
    const currentLookAt = new THREE.Vector3();
    cameraRef.current.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(10).add(cameraRef.current.position);
    currentLookAt.lerp(targetLookAt, 0.05);
    cameraRef.current.lookAt(currentLookAt);
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 10, 0.5]} fov={65} />;
};

const Index = () => {
  const {
    playerHands,
    dealerHand,
    balance,
    currentBet,
    gamePhase,
    message,
    resetGame
  } = useBlackjackGame();

  return (
    <div className="h-screen felt-texture flex flex-col overflow-hidden">
      {/* Premium Header */}
      <header className="wood-grain p-4 border-b-4 border-gold/30 flex-shrink-0 shadow-lg">
        <div className="max-w-[1800px] mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold gold-text tracking-wider">BLACKJACK</h1>
            <p className="text-sm text-gold/80 font-semibold">Premium Casino Experience</p>
          </div>
          <div className="flex gap-8 items-center">
            <div className="text-right bg-card/50 px-6 py-3 rounded-lg border-2 border-gold/40">
              <p className="text-xs text-gold uppercase tracking-wide font-semibold">Balance</p>
              <p className="text-2xl font-bold gold-text">${balance}</p>
            </div>
            {currentBet > 0 && (
              <div className="text-right bg-primary/20 px-6 py-3 rounded-lg border-2 border-primary/60">
                <p className="text-xs text-primary uppercase tracking-wide font-semibold">Bet</p>
                <p className="text-2xl font-bold text-primary">${currentBet}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-4 p-4 max-w-[1800px] mx-auto w-full min-h-0">
        {/* 3D Table - Much Larger */}
        <div className="flex-1 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] border-4 border-wood casino-glow">
          <Canvas shadows gl={{ antialias: true, alpha: false }}>
            <CameraController gamePhase={gamePhase} />
            <BlackjackTable
              playerHands={playerHands}
              dealerHand={dealerHand}
              gamePhase={gamePhase}
            />
          </Canvas>
        </div>

        {/* Side Panel - Compact */}
        <div className="w-96 space-y-3 flex flex-col overflow-y-auto">
          {/* Card Count Info - Educational */}
          <CardCountingPanel />

          {/* Message/Status */}
          <Card className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-md border-2 border-primary/40 shadow-xl flex-shrink-0">
            <p className="text-center text-lg font-bold text-foreground">
              {message}
            </p>
            {gamePhase === 'playing' && playerHands[0] && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Your hand: <span className="font-bold text-primary">{playerHands[0].value}</span> {playerHands[0].isSoft && <span className="text-xs">(soft)</span>}
              </p>
            )}
            {gamePhase === 'dealer' && dealerHand && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Dealer: <span className="font-bold text-destructive">{dealerHand.value}</span>
              </p>
            )}
          </Card>

          {/* Agent Panel */}
          <div className="flex-shrink-0">
            <AgentPanel />
          </div>

          {/* Controls */}
          <div className="space-y-3 flex-shrink-0">
            <BettingPanel />
            <GameControls />
            
            {gamePhase === 'finished' && (
              <Button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-black font-bold shadow-xl hover:shadow-2xl transition-all text-lg py-6"
                size="lg"
              >
                New Round
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
