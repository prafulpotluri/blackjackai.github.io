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
    <div className="space-y-4 p-4 bg-gradient-to-br from-card/95 to-card/80 rounded-xl border-2 border-gold/30 shadow-xl">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gold uppercase tracking-wide mb-1">Place Your Bet</h3>
        <p className="text-sm text-muted-foreground">Balance: <span className="gold-text font-bold text-xl">${balance}</span></p>
      </div>
      
      <div className="flex gap-3 justify-center flex-wrap">
        {CHIP_VALUES.map(value => {
          const chipColors = {
            5: 'bg-chip-red border-red-700',
            25: 'bg-chip-green border-green-700',
            100: 'bg-chip-black border-gray-600',
            500: 'bg-chip-blue border-blue-700'
          };
          return (
            <Button
              key={value}
              onClick={() => setBetAmount(value)}
              variant="outline"
              className={`w-20 h-20 rounded-full font-bold text-white shadow-xl hover:shadow-2xl transition-all border-4 ${chipColors[value as keyof typeof chipColors]} ${betAmount === value ? 'ring-4 ring-gold scale-110' : 'hover:scale-105'}`}
              disabled={value > balance}
            >
              <span className="text-lg">${value}</span>
            </Button>
          );
        })}
      </div>
      
      <div className="flex gap-3 items-center">
        <Input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          min={1}
          max={balance}
          className="text-center text-xl font-bold bg-background/60 border-2 border-gold/40 h-14"
        />
        <Button
          onClick={handleBet}
          disabled={betAmount <= 0 || betAmount > balance}
          size="lg"
          className="bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-black font-bold shadow-xl hover:shadow-2xl transition-all px-10 h-14 text-lg"
        >
          DEAL
        </Button>
      </div>
    </div>
  );
};
