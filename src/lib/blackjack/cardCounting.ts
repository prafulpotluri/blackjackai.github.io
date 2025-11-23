import { Card } from './types';

// Hi-Lo card counting system
export const getCardCountValue = (card: Card): number => {
  const rank = card.rank;
  
  // Low cards (2-6) = +1
  if (['2', '3', '4', '5', '6'].includes(rank)) return 1;
  
  // Neutral cards (7-9) = 0
  if (['7', '8', '9'].includes(rank)) return 0;
  
  // High cards (10, J, Q, K, A) = -1
  return -1;
};

export const updateRunningCount = (runningCount: number, card: Card): number => {
  return runningCount + getCardCountValue(card);
};

export const calculateTrueCount = (runningCount: number, decksRemaining: number): number => {
  if (decksRemaining === 0) return 0;
  return Math.round(runningCount / decksRemaining);
};

export const calculateDecksRemaining = (cardsRemaining: number): number => {
  return Math.max(1, Math.round(cardsRemaining / 52 * 10) / 10);
};

export const getCountAdvantage = (trueCount: number): number => {
  // Each +1 true count gives approximately 0.5% advantage
  return trueCount * 0.5;
};
