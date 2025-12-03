import { supabase } from "@/integrations/supabase/client";
import { Card } from "./types";

export interface HandRecord {
  playerCards: Card[];
  dealerUpCard: number;
  dealerFinalCards?: Card[];
  playerValue: number;
  dealerValue?: number;
  isSoft: boolean;
  isPair: boolean;
  pairRank?: string;
  trueCount: number;
  runningCount: number;
  actionsTaken: string[];
  recommendedAction?: string;
  finalResult?: 'win' | 'lose' | 'push' | 'blackjack';
  betAmount: number;
  profitLoss?: number;
  wasBlackjack: boolean;
}

export interface HistoricalAnalysis {
  situationCount: number;
  actionStats: {
    action: string;
    timesPlayed: number;
    winRate: number;
    avgProfit: number;
  }[];
  bestHistoricalAction?: string;
  confidence: number;
}

let currentSessionId: string | null = null;

const getTrueCountRange = (trueCount: number): string => {
  if (trueCount <= -3) return 'very_negative';
  if (trueCount <= -1) return 'negative';
  if (trueCount <= 1) return 'neutral';
  if (trueCount <= 3) return 'positive';
  return 'very_positive';
};

export const initializeSession = async (): Promise<string> => {
  if (currentSessionId) return currentSessionId;
  
  const { data, error } = await supabase
    .from('game_sessions')
    .insert([{ total_hands: 0, total_profit: 0 }])
    .select('id')
    .single();
  
  if (error) {
    console.error('Failed to create session:', error);
    throw error;
  }
  
  currentSessionId = data.id;
  return currentSessionId;
};

export const saveHandRecord = async (record: HandRecord): Promise<void> => {
  try {
    const sessionId = await initializeSession();
    
    // Save the hand record
    const { error: handError } = await supabase.from('game_hands').insert([{
      session_id: sessionId,
      player_cards: JSON.parse(JSON.stringify(record.playerCards)),
      dealer_up_card: record.dealerUpCard,
      dealer_final_cards: record.dealerFinalCards ? JSON.parse(JSON.stringify(record.dealerFinalCards)) : null,
      player_value: record.playerValue,
      dealer_value: record.dealerValue,
      is_soft: record.isSoft,
      is_pair: record.isPair,
      pair_rank: record.pairRank,
      true_count: record.trueCount,
      running_count: record.runningCount,
      actions_taken: JSON.parse(JSON.stringify(record.actionsTaken)),
      recommended_action: record.recommendedAction,
      final_result: record.finalResult,
      bet_amount: record.betAmount,
      profit_loss: record.profitLoss,
      was_blackjack: record.wasBlackjack
    }]);
    
    if (handError) {
      console.error('Failed to save hand:', handError);
      return;
    }
    
    // Update action outcomes for learning
    if (record.finalResult && record.actionsTaken.length > 0) {
      const primaryAction = record.actionsTaken[0];
      const trueCountRange = getTrueCountRange(record.trueCount);
      
      // Upsert the action outcome
      const { data: existing } = await supabase
        .from('action_outcomes')
        .select('*')
        .eq('player_value', record.playerValue)
        .eq('dealer_up_card', record.dealerUpCard)
        .eq('is_soft', record.isSoft)
        .eq('is_pair', record.isPair)
        .eq('true_count_range', trueCountRange)
        .eq('action_taken', primaryAction)
        .single();
      
      if (existing) {
        const isWin = record.finalResult === 'win' || record.finalResult === 'blackjack';
        const isLose = record.finalResult === 'lose';
        const isPush = record.finalResult === 'push';
        
        await supabase.from('action_outcomes').update({
          times_played: existing.times_played + 1,
          times_won: existing.times_won + (isWin ? 1 : 0),
          times_lost: existing.times_lost + (isLose ? 1 : 0),
          times_push: existing.times_push + (isPush ? 1 : 0),
          total_profit: existing.total_profit + (record.profitLoss || 0)
        }).eq('id', existing.id);
      } else {
        const isWin = record.finalResult === 'win' || record.finalResult === 'blackjack';
        const isLose = record.finalResult === 'lose';
        const isPush = record.finalResult === 'push';
        
        await supabase.from('action_outcomes').insert([{
          player_value: record.playerValue,
          dealer_up_card: record.dealerUpCard,
          is_soft: record.isSoft,
          is_pair: record.isPair,
          true_count_range: trueCountRange,
          action_taken: primaryAction,
          times_played: 1,
          times_won: isWin ? 1 : 0,
          times_lost: isLose ? 1 : 0,
          times_push: isPush ? 1 : 0,
          total_profit: record.profitLoss || 0
        }]);
      }
    }
    
    console.log('Hand saved successfully');
  } catch (error) {
    console.error('Error saving hand record:', error);
  }
};

export const getHistoricalAnalysis = async (
  playerValue: number,
  dealerUpCard: number,
  isSoft: boolean,
  isPair: boolean,
  trueCount: number
): Promise<HistoricalAnalysis> => {
  try {
    const trueCountRange = getTrueCountRange(trueCount);
    
    // Get action outcomes for this situation
    const { data: outcomes, error } = await supabase
      .from('action_outcomes')
      .select('*')
      .eq('player_value', playerValue)
      .eq('dealer_up_card', dealerUpCard)
      .eq('is_soft', isSoft)
      .eq('is_pair', isPair)
      .eq('true_count_range', trueCountRange);
    
    if (error || !outcomes || outcomes.length === 0) {
      // Try without count range for more data
      const { data: broaderOutcomes } = await supabase
        .from('action_outcomes')
        .select('*')
        .eq('player_value', playerValue)
        .eq('dealer_up_card', dealerUpCard)
        .eq('is_soft', isSoft)
        .eq('is_pair', isPair);
      
      if (!broaderOutcomes || broaderOutcomes.length === 0) {
        return {
          situationCount: 0,
          actionStats: [],
          confidence: 0
        };
      }
      
      return processOutcomes(broaderOutcomes, 0.5);
    }
    
    return processOutcomes(outcomes, 1.0);
  } catch (error) {
    console.error('Error fetching historical analysis:', error);
    return {
      situationCount: 0,
      actionStats: [],
      confidence: 0
    };
  }
};

interface ActionOutcomeRow {
  action_taken: string;
  times_played: number;
  win_rate: number | null;
  total_profit: number;
}

const processOutcomes = (outcomes: ActionOutcomeRow[], confidenceMultiplier: number): HistoricalAnalysis => {
  const totalPlayed = outcomes.reduce((sum, o) => sum + o.times_played, 0);
  
  const actionStats = outcomes.map(o => ({
    action: o.action_taken,
    timesPlayed: o.times_played,
    winRate: o.win_rate || 0,
    avgProfit: o.times_played > 0 ? o.total_profit / o.times_played : 0
  }));
  
  // Find best historical action based on win rate and profit
  let bestAction: string | undefined;
  let bestScore = -Infinity;
  
  for (const stat of actionStats) {
    if (stat.timesPlayed >= 3) { // Only consider if we have enough data
      const score = stat.winRate * 0.6 + (stat.avgProfit > 0 ? 0.4 : 0);
      if (score > bestScore) {
        bestScore = score;
        bestAction = stat.action;
      }
    }
  }
  
  // Confidence based on sample size
  const confidence = Math.min(1, (totalPlayed / 50)) * confidenceMultiplier;
  
  return {
    situationCount: totalPlayed,
    actionStats,
    bestHistoricalAction: bestAction,
    confidence
  };
};

export const getTotalHandsPlayed = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('game_hands')
      .select('*', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
};

export const getOverallStats = async () => {
  try {
    const { data, error } = await supabase
      .from('game_hands')
      .select('final_result, profit_loss');
    
    if (error || !data) return null;
    
    const wins = data.filter(h => h.final_result === 'win' || h.final_result === 'blackjack').length;
    const losses = data.filter(h => h.final_result === 'lose').length;
    const pushes = data.filter(h => h.final_result === 'push').length;
    const totalProfit = data.reduce((sum, h) => sum + (h.profit_loss || 0), 0);
    
    return {
      totalHands: data.length,
      wins,
      losses,
      pushes,
      winRate: data.length > 0 ? wins / data.length : 0,
      totalProfit
    };
  } catch {
    return null;
  }
};
