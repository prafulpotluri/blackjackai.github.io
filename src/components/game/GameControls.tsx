import { Button } from '@/components/ui/button';
import { useBlackjackGame } from '@/hooks/useBlackjackGame';

export const GameControls = () => {
  const { hit, stand, double, split, surrender, balance, currentBet, gamePhase, playerHands } = useBlackjackGame();
  
  if (gamePhase !== 'playing') return null;
  
  const canSplit = playerHands[0]?.cards.length === 2 && 
                   playerHands[0].cards[0].rank === playerHands[0].cards[1].rank;
  const canDouble = playerHands[0]?.cards.length === 2 && balance >= currentBet;
  
  return (
    <div className="flex gap-3 justify-center flex-wrap">
      <Button
        onClick={hit}
        variant="default"
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
      >
        Hit
      </Button>
      
      <Button
        onClick={stand}
        variant="secondary"
        size="lg"
        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg hover:shadow-xl transition-all"
      >
        Stand
      </Button>
      
      {canDouble && (
        <Button
          onClick={double}
          variant="outline"
          size="lg"
          className="border-gold text-gold hover:bg-gold/10 shadow-lg hover:shadow-xl transition-all"
        >
          Double Down
        </Button>
      )}
      
      {canSplit && (
        <Button
          onClick={split}
          variant="outline"
          size="lg"
          className="border-accent text-accent hover:bg-accent/10 shadow-lg hover:shadow-xl transition-all"
        >
          Split
        </Button>
      )}
      
      <Button
        onClick={surrender}
        variant="destructive"
        size="lg"
        className="shadow-lg hover:shadow-xl transition-all"
      >
        Surrender
      </Button>
    </div>
  );
};
