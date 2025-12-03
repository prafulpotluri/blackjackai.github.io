import { Button } from '@/components/ui/button';
import { useBlackjackGame } from '@/hooks/useBlackjackGame';

export const GameControls = () => {
  const { hit, stand, double, split, balance, currentBet, gamePhase, playerHands } = useBlackjackGame();
  
  if (gamePhase !== 'playing') return null;
  
  const canSplit = playerHands[0]?.cards.length === 2 && 
                   playerHands[0].cards[0].rank === playerHands[0].cards[1].rank;
  const canDouble = playerHands[0]?.cards.length === 2 && balance >= currentBet;
  
  return (
    <div className="flex gap-2 justify-center flex-wrap p-3 bg-gradient-to-br from-card/95 to-card/80 rounded-xl border-2 border-primary/40 shadow-xl">
      <Button
        onClick={hit}
        size="lg"
        className="flex-1 min-w-[100px] bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-bold shadow-xl hover:shadow-2xl transition-all text-base h-14"
      >
        HIT
      </Button>
      
      <Button
        onClick={stand}
        size="lg"
        className="flex-1 min-w-[100px] bg-gradient-to-br from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-white font-bold shadow-xl hover:shadow-2xl transition-all text-base h-14"
      >
        STAND
      </Button>
      
      {canDouble && (
        <Button
          onClick={double}
          size="lg"
          className="flex-1 min-w-[100px] bg-gradient-to-br from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-black font-bold shadow-xl hover:shadow-2xl transition-all text-base h-14"
        >
          DOUBLE
        </Button>
      )}
      
      {canSplit && (
        <Button
          onClick={split}
          size="lg"
          className="flex-1 min-w-[100px] bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white font-bold shadow-xl hover:shadow-2xl transition-all text-base h-14"
        >
          SPLIT
        </Button>
      )}
    </div>
  );
};
