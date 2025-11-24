import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useBlackjackGame } from '@/hooks/useBlackjackGame';
import { AgentAdvice } from '@/lib/blackjack/types';
import { Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AgentPanel = () => {
  const { gamePhase, getAgentAdvice } = useBlackjackGame();
  const [advice, setAdvice] = useState<AgentAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (gamePhase === 'playing') {
      setLoading(true);
      getAgentAdvice().then(result => {
        setAdvice(result);
        setLoading(false);
      });
    } else {
      setAdvice(null);
    }
  }, [gamePhase, getAgentAdvice]);
  
  if (gamePhase !== 'playing' || !advice) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-5 bg-gradient-to-br from-gold/20 to-gold/10 backdrop-blur-md border-2 border-gold/50 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-xl border-2 border-gold/40">
              {loading ? (
                <Loader2 className="w-8 h-8 text-black animate-spin" />
              ) : (
                <Sparkles className="w-8 h-8 text-black" />
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-base font-bold text-gold uppercase tracking-wide mb-2">Strategy Angel</h3>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-3xl font-bold gold-text uppercase tracking-wide">
                    {advice.action}
                  </span>
                  <span className="text-sm px-4 py-1.5 rounded-full bg-primary/30 text-primary font-bold border border-primary/50">
                    {(advice.winProbability * 100).toFixed(1)}% Win
                  </span>
                </div>
              </div>
              
              <p className="text-foreground leading-relaxed font-medium text-sm">
                {loading ? 'Analyzing the cards...' : advice.explanation}
              </p>
              
              <div className="pt-3 border-t border-gold/30">
                <p className="text-xs text-muted-foreground font-semibold">
                  💡 {advice.reason}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
