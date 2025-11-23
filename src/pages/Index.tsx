import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { BlackjackTable } from '@/components/game/BlackjackTable';
import { GameControls } from '@/components/game/GameControls';
import { BettingPanel } from '@/components/game/BettingPanel';
import { AgentPanel } from '@/components/game/AgentPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBlackjackGame } from '@/hooks/useBlackjackGame';

const Index = () => {
  const {
    playerHands,
    dealerHand,
    balance,
    currentBet,
    gamePhase,
    message,
    runningCount,
    trueCount,
    decksRemaining,
    resetGame
  } = useBlackjackGame();

  return (
    <div className="min-h-screen felt-texture flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-border/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold gold-text">Blackjack Master</h1>
            <p className="text-sm text-muted-foreground">Learn card counting with your AI angel</p>
          </div>
          <div className="flex gap-6 items-center">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold gold-text">${balance}</p>
            </div>
            {currentBet > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Bet</p>
                <p className="text-xl font-bold text-primary">${currentBet}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* 3D Table */}
        <div className="flex-1 min-h-[500px] lg:min-h-0 rounded-xl overflow-hidden shadow-2xl border-2 border-primary/20">
          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[0, 6, 6]} fov={50} />
            <OrbitControls
              enablePan={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2.5}
              minDistance={4}
              maxDistance={10}
            />
            <BlackjackTable
              playerHands={playerHands}
              dealerHand={dealerHand}
              gamePhase={gamePhase}
            />
          </Canvas>
        </div>

        {/* Side Panel */}
        <div className="w-full lg:w-96 space-y-6">
          {/* Card Count Info */}
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/30">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Card Counting</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Running</p>
                <p className="text-2xl font-bold text-foreground">
                  {runningCount > 0 ? '+' : ''}{runningCount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">True Count</p>
                <p className="text-2xl font-bold text-primary">
                  {trueCount > 0 ? '+' : ''}{trueCount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Decks Left</p>
                <p className="text-2xl font-bold text-accent">
                  {decksRemaining.toFixed(1)}
                </p>
              </div>
            </div>
          </Card>

          {/* Message/Status */}
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/30">
            <p className="text-center text-lg font-semibold text-foreground">
              {message}
            </p>
            {gamePhase === 'playing' && playerHands[0] && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Your hand: {playerHands[0].value} {playerHands[0].isSoft && '(soft)'}
              </p>
            )}
            {gamePhase === 'dealer' && dealerHand && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Dealer's hand: {dealerHand.value}
              </p>
            )}
          </Card>

          {/* Agent Panel */}
          <AgentPanel />

          {/* Controls */}
          <div className="space-y-4">
            <BettingPanel />
            <GameControls />
            
            {gamePhase === 'finished' && (
              <Button
                onClick={resetGame}
                className="w-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
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
