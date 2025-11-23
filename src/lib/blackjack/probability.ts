import { Hand, Card } from './types';

export const calculateWinProbability = (
  playerHand: Hand,
  dealerUpCard: number,
  trueCount: number,
  action: 'hit' | 'stand' | 'double' | 'split' | 'surrender'
): number => {
  if (playerHand.isBusted) return 0;
  if (playerHand.isBlackjack) return 1.5;
  
  const playerValue = playerHand.value;
  
  // Base probabilities from statistical analysis
  let baseProbability = 0.5;
  
  if (action === 'stand') {
    // Dealer bust probabilities based on up card
    const dealerBustProb: { [key: number]: number } = {
      2: 0.35, 3: 0.37, 4: 0.40, 5: 0.42, 6: 0.42,
      7: 0.26, 8: 0.24, 9: 0.23, 10: 0.23, 11: 0.17
    };
    
    const bustProb = dealerBustProb[dealerUpCard] || 0.23;
    
    if (playerValue >= 17) {
      baseProbability = bustProb + (21 - playerValue) * 0.04;
    } else if (playerValue >= 12) {
      baseProbability = bustProb * 0.7;
    } else {
      baseProbability = 0.3;
    }
  } else if (action === 'hit') {
    // Probability of improving hand without busting
    const cardsHelp = Math.max(0, 21 - playerValue);
    const bustRisk = Math.max(0, playerValue - 11) / 10;
    baseProbability = (cardsHelp / 13) * (1 - bustRisk);
  } else if (action === 'double') {
    // Similar to hit but with higher risk/reward
    const cardsHelp = Math.max(0, 21 - playerValue);
    baseProbability = (cardsHelp / 13) * 1.3;
  } else if (action === 'split') {
    baseProbability = 0.55; // Splitting is generally favorable
  } else if (action === 'surrender') {
    return 0; // Surrender means definite loss of half bet
  }
  
  // Adjust for true count
  const countAdjustment = trueCount * 0.015;
  baseProbability += countAdjustment;
  
  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, baseProbability));
};

export const formatProbability = (probability: number): string => {
  return `${(probability * 100).toFixed(1)}%`;
};
