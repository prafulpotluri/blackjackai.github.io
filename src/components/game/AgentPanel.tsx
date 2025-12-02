import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useBlackjackGame } from '@/hooks/useBlackjackGame';
import { AgentAdvice } from '@/lib/blackjack/types';
import { Loader2, Sparkles, BookOpen, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AgentPanel = () => {
  const { gamePhase, getAgentAdvice, playerHands, currentHandIndex } = useBlackjackGame();
  const [advice, setAdvice] = useState<AgentAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Get current hand card count to trigger updates on every card
  const currentHand = playerHands[currentHandIndex];
  const cardCount = currentHand?.cards?.length || 0;
  
  useEffect(() => {
    if (gamePhase === 'playing' && cardCount > 0) {
      setLoading(true);
      getAgentAdvice().then(result => {
        setAdvice(result);
        setLoading(false);
      });
    } else {
      setAdvice(null);
    }
  }, [gamePhase, cardCount, getAgentAdvice]);
  
  if (gamePhase !== 'playing' || !advice) return null;
  
  const actionColors: Record<string, string> = {
    hit: 'from-green-500 to-emerald-600',
    stand: 'from-blue-500 to-indigo-600',
    double: 'from-amber-500 to-orange-600',
    split: 'from-purple-500 to-violet-600'
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${advice.action}-${cardCount}`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        {/* Main Action Card */}
        <Card className="p-4 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md border-2 border-gold/40 shadow-xl">
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${actionColors[advice.action] || 'from-gold to-gold-dark'} flex items-center justify-center shadow-lg`}>
              {loading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Sparkles className="w-6 h-6 text-white" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-xs font-bold text-gold uppercase tracking-wide">Strategy Angel</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-bold">
                  {(advice.winProbability * 100).toFixed(0)}% Win
                </span>
              </div>
              
              <div className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${actionColors[advice.action]} mb-3`}>
                <span className="text-xl font-black text-white uppercase tracking-wider">
                  {advice.action}
                </span>
              </div>
              
              <p className="text-sm text-foreground leading-relaxed">
                {loading ? 'Analyzing...' : advice.explanation}
              </p>
              
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                📊 {advice.reason}
              </p>
            </div>
          </div>
        </Card>

        {/* Strategy Tip */}
        <Card className="p-3 bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-500/30">
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-blue-400 uppercase mb-1">Strategy Rule</h4>
              <p className="text-xs text-blue-100/90 leading-relaxed">{advice.strategyTip}</p>
            </div>
          </div>
        </Card>

        {/* Card Counting Lesson */}
        <Card className="p-3 bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-500/30">
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase mb-1">Card Counting</h4>
              <p className="text-xs text-amber-100/90 leading-relaxed">{advice.cardCountingLesson}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
