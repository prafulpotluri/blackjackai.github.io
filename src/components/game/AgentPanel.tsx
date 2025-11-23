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
        <Card className="p-6 bg-card/90 backdrop-blur-sm border-2 border-primary/30 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              {loading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Sparkles className="w-6 h-6 text-white" />
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Angel's Advice</h3>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold gold-text uppercase">
                    {advice.action}
                  </span>
                  <span className="text-sm px-3 py-1 rounded-full bg-primary/20 text-primary font-semibold">
                    {(advice.winProbability * 100).toFixed(1)}% Win Rate
                  </span>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                {loading ? 'Analyzing the cards...' : advice.explanation}
              </p>
              
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground italic">
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
