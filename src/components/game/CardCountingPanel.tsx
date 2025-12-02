import { Card } from '@/components/ui/card';
import { useBlackjackGame } from '@/hooks/useBlackjackGame';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

export const CardCountingPanel = () => {
  const { runningCount, trueCount, decksRemaining, playerHands, dealerHand, gamePhase } = useBlackjackGame();
  
  // Determine count status
  const getCountStatus = () => {
    if (trueCount >= 3) return { label: 'HOT DECK', color: 'text-green-400', bg: 'bg-green-500/20', icon: TrendingUp };
    if (trueCount >= 1) return { label: 'FAVORABLE', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: TrendingUp };
    if (trueCount <= -3) return { label: 'COLD DECK', color: 'text-red-400', bg: 'bg-red-500/20', icon: TrendingDown };
    if (trueCount <= -1) return { label: 'UNFAVORABLE', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: TrendingDown };
    return { label: 'NEUTRAL', color: 'text-gray-400', bg: 'bg-gray-500/20', icon: Minus };
  };
  
  const status = getCountStatus();
  const StatusIcon = status.icon;
  
  // Get recently dealt cards for display
  const recentCards = [
    ...(playerHands[0]?.cards || []),
    ...(dealerHand?.cards || [])
  ].slice(-6);
  
  const getCardCountValue = (rank: string): number => {
    if (['2', '3', '4', '5', '6'].includes(rank)) return 1;
    if (['7', '8', '9'].includes(rank)) return 0;
    return -1;
  };
  
  return (
    <Card className="p-4 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md border-2 border-gold/30 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gold uppercase tracking-wide">Card Counting</h3>
        <div className={`px-2 py-1 rounded-full ${status.bg} flex items-center gap-1`}>
          <StatusIcon className={`w-3 h-3 ${status.color}`} />
          <span className={`text-xs font-bold ${status.color}`}>{status.label}</span>
        </div>
      </div>
      
      {/* Count Display */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center bg-background/40 rounded-lg p-2">
          <p className="text-[10px] text-muted-foreground uppercase">Running</p>
          <p className={`text-xl font-bold ${runningCount > 0 ? 'text-green-400' : runningCount < 0 ? 'text-red-400' : 'text-foreground'}`}>
            {runningCount > 0 ? '+' : ''}{runningCount}
          </p>
        </div>
        <div className="text-center bg-primary/10 rounded-lg p-2 border border-primary/30">
          <p className="text-[10px] text-primary uppercase">True Count</p>
          <p className={`text-xl font-bold ${trueCount > 0 ? 'text-green-400' : trueCount < 0 ? 'text-red-400' : 'text-primary'}`}>
            {trueCount > 0 ? '+' : ''}{trueCount}
          </p>
        </div>
        <div className="text-center bg-accent/10 rounded-lg p-2">
          <p className="text-[10px] text-accent uppercase">Decks Left</p>
          <p className="text-xl font-bold text-accent">
            {decksRemaining.toFixed(1)}
          </p>
        </div>
      </div>
      
      {/* Recent Cards with Count Values */}
      {gamePhase !== 'betting' && recentCards.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-muted-foreground uppercase mb-2">Cards This Round</p>
          <div className="flex gap-1 flex-wrap">
            {recentCards.map((card, i) => {
              const countValue = getCardCountValue(card.rank);
              return (
                <div
                  key={i}
                  className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                    countValue === 1 ? 'bg-green-500/20 text-green-400' :
                    countValue === -1 ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  <span>{card.rank}</span>
                  <span className="text-[10px]">({countValue > 0 ? '+' : ''}{countValue})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Hi-Lo Quick Reference */}
      <div className="pt-2 border-t border-border/50">
        <div className="flex items-start gap-2">
          <Info className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="text-green-400 font-bold">2-6 = +1</span> • 
            <span className="text-gray-400 font-bold"> 7-9 = 0</span> • 
            <span className="text-red-400 font-bold"> 10-A = -1</span>
            <br />
            True Count = Running ÷ Decks Remaining
          </p>
        </div>
      </div>
    </Card>
  );
};
