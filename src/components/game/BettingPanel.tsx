import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBlackjackGame } from '@/hooks/useBlackjackGame';

const CHIP_VALUES = [5, 25, 100, 500];

export const BettingPanel = () => {
  const { balance, placeBet, gamePhase } = useBlackjackGame();
  const [betAmount, setBetAmount] = useState(25);
  
  if (gamePhase !== 'betting') return null;
  
  const handleBet = () => {
    if (betAmount > 0 && betAmount <= balance) {
      placeBet(betAmount);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-foreground mb-2">Place Your Bet</h3>
        <p className="text-muted-foreground">Balance: <span className="gold-text font-bold">${balance}</span></p>
      </div>
      
      <div className="flex gap-2 justify-center flex-wrap">
        {CHIP_VALUES.map(value => (
          <Button
            key={value}
            onClick={() => setBetAmount(value)}
            variant={betAmount === value ? 'default' : 'outline'}
            className="w-16 h-16 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
            disabled={value > balance}
          >
            ${value}
          </Button>
        ))}
      </div>
      
      <div className="flex gap-2 items-center">
        <Input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          min={1}
          max={balance}
          className="text-center text-lg font-bold"
        />
        <Button
          onClick={handleBet}
          disabled={betAmount <= 0 || betAmount > balance}
          size="lg"
          className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all px-8"
        >
          Deal
        </Button>
      </div>
    </div>
  );
};
