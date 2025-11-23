import { Hand, BasicStrategyDecision } from './types';

// Basic Strategy - Hard Totals
const hardStrategy: { [key: string]: { [key: number]: string } } = {
  '8': { 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  '9': { 2: 'H', 3: 'Dh', 4: 'Dh', 5: 'Dh', 6: 'Dh', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  '10': { 2: 'Dh', 3: 'Dh', 4: 'Dh', 5: 'Dh', 6: 'Dh', 7: 'Dh', 8: 'Dh', 9: 'Dh', 10: 'H', 11: 'H' },
  '11': { 2: 'Dh', 3: 'Dh', 4: 'Dh', 5: 'Dh', 6: 'Dh', 7: 'Dh', 8: 'Dh', 9: 'Dh', 10: 'Dh', 11: 'Dh' },
  '12': { 2: 'H', 3: 'H', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  '13': { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  '14': { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  '15': { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'H', 10: 'Sr', 11: 'Sr' },
  '16': { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'Sr', 10: 'Sr', 11: 'Sr' },
  '17': { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 11: 'S' }
};

// Soft Totals
const softStrategy: { [key: string]: { [key: number]: string } } = {
  '13': { 2: 'H', 3: 'H', 4: 'H', 5: 'Dh', 6: 'Dh', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  '14': { 2: 'H', 3: 'H', 4: 'H', 5: 'Dh', 6: 'Dh', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  '15': { 2: 'H', 3: 'H', 4: 'Dh', 5: 'Dh', 6: 'Dh', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  '16': { 2: 'H', 3: 'H', 4: 'Dh', 5: 'Dh', 6: 'Dh', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  '17': { 2: 'H', 3: 'Dh', 4: 'Dh', 5: 'Dh', 6: 'Dh', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  '18': { 2: 'Ds', 3: 'Ds', 4: 'Ds', 5: 'Ds', 6: 'Ds', 7: 'S', 8: 'S', 9: 'H', 10: 'H', 11: 'H' },
  '19': { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'Ds', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 11: 'S' }
};

// Pair Splitting
const pairStrategy: { [key: string]: { [key: number]: string } } = {
  'A': { 2: 'Y', 3: 'Y', 4: 'Y', 5: 'Y', 6: 'Y', 7: 'Y', 8: 'Y', 9: 'Y', 10: 'Y', 11: 'Y' },
  '2': { 2: 'Y', 3: 'Y', 4: 'Y', 5: 'Y', 6: 'Y', 7: 'Y', 8: 'N', 9: 'N', 10: 'N', 11: 'N' },
  '3': { 2: 'Y', 3: 'Y', 4: 'Y', 5: 'Y', 6: 'Y', 7: 'Y', 8: 'N', 9: 'N', 10: 'N', 11: 'N' },
  '4': { 2: 'N', 3: 'N', 4: 'N', 5: 'Y', 6: 'Y', 7: 'N', 8: 'N', 9: 'N', 10: 'N', 11: 'N' },
  '5': { 2: 'N', 3: 'N', 4: 'N', 5: 'N', 6: 'N', 7: 'N', 8: 'N', 9: 'N', 10: 'N', 11: 'N' },
  '6': { 2: 'Y', 3: 'Y', 4: 'Y', 5: 'Y', 6: 'Y', 7: 'N', 8: 'N', 9: 'N', 10: 'N', 11: 'N' },
  '7': { 2: 'Y', 3: 'Y', 4: 'Y', 5: 'Y', 6: 'Y', 7: 'Y', 8: 'N', 9: 'N', 10: 'N', 11: 'N' },
  '8': { 2: 'Y', 3: 'Y', 4: 'Y', 5: 'Y', 6: 'Y', 7: 'Y', 8: 'Y', 9: 'Y', 10: 'Y', 11: 'Y' },
  '9': { 2: 'Y', 3: 'Y', 4: 'Y', 5: 'Y', 6: 'Y', 7: 'N', 8: 'Y', 9: 'Y', 10: 'N', 11: 'N' },
  '10': { 2: 'N', 3: 'N', 4: 'N', 5: 'N', 6: 'N', 7: 'N', 8: 'N', 9: 'N', 10: 'N', 11: 'N' }
};

export const getBasicStrategy = (
  playerHand: Hand,
  dealerUpCard: number,
  canSplit: boolean,
  canDouble: boolean
): BasicStrategyDecision => {
  const playerValue = playerHand.value;
  
  // Check for pair splitting first
  if (canSplit && playerHand.cards.length === 2) {
    const pairRank = playerHand.cards[0].rank === 'A' ? 'A' : 
                     ['J', 'Q', 'K'].includes(playerHand.cards[0].rank) ? '10' :
                     playerHand.cards[0].rank;
    
    const splitDecision = pairStrategy[pairRank]?.[dealerUpCard];
    if (splitDecision === 'Y') {
      return { action: 'split' };
    }
  }
  
  // Soft hands
  if (playerHand.isSoft && playerValue <= 19) {
    const decision = softStrategy[playerValue.toString()]?.[dealerUpCard] || 'S';
    
    if (decision === 'Dh') {
      return canDouble ? { action: 'double', alternative: 'hit' } : { action: 'hit' };
    }
    if (decision === 'Ds') {
      return canDouble ? { action: 'double', alternative: 'stand' } : { action: 'stand' };
    }
    return { action: decision === 'H' ? 'hit' : 'stand' };
  }
  
  // Hard hands
  const hardValue = Math.min(playerValue, 17);
  const decision = hardStrategy[hardValue.toString()]?.[dealerUpCard] || 
                   (playerValue >= 17 ? 'S' : 'H');
  
  if (decision === 'Dh') {
    return canDouble ? { action: 'double', alternative: 'hit' } : { action: 'hit' };
  }
  if (decision === 'Sr') {
    return { action: 'surrender', alternative: 'hit' };
  }
  
  return { action: decision === 'H' ? 'hit' : 'stand' };
};
