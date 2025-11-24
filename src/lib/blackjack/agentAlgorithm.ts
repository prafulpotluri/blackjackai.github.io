import { Hand } from './types';
import { getBasicStrategy } from './strategy';
import { calculateWinProbability } from './probability';

interface AgentRecommendation {
  action: 'hit' | 'stand' | 'double' | 'split' | 'surrender';
  winProbability: number;
  reason: string;
  explanation: string;
}

export const getAgentRecommendation = (
  playerHand: Hand,
  dealerUpCard: number,
  trueCount: number,
  canSplit: boolean,
  canDouble: boolean,
  balance: number,
  currentBet: number
): AgentRecommendation => {
  const strategy = getBasicStrategy(playerHand, dealerUpCard, canSplit, canDouble);
  const action = strategy.action;
  const winProbability = calculateWinProbability(playerHand, dealerUpCard, trueCount, action);
  
  // Generate explanation based on data science analysis
  let explanation = '';
  let reason = '';
  
  const playerValue = playerHand.value;
  const isSoft = playerHand.isSoft;
  const isPair = playerHand.cards.length === 2 && playerHand.cards[0].rank === playerHand.cards[1].rank;
  
  // Count adjustment explanation
  const countAdvantage = trueCount * 0.5;
  const countImpact = Math.abs(countAdvantage) > 1 ? 'significantly' : 'slightly';
  
  if (action === 'hit') {
    const bustRisk = Math.max(0, (playerValue - 11) / 10 * 100);
    const cardsHelp = 21 - playerValue;
    
    explanation = `With ${playerValue} against dealer's ${dealerUpCard}, hitting gives you the best chance. `;
    
    if (bustRisk > 50) {
      explanation += `Although bust risk is ${bustRisk.toFixed(0)}%, standing would likely lose to dealer's potential ${dealerUpCard + 10}. `;
    } else {
      explanation += `Your bust risk is only ${bustRisk.toFixed(0)}%, and ${cardsHelp} cards can improve your hand. `;
    }
    
    if (trueCount > 2) {
      explanation += `The count of +${trueCount} means more high cards remain, but hitting is still optimal here.`;
    } else if (trueCount < -2) {
      explanation += `Despite the count of ${trueCount}, hitting is your best statistical play.`;
    }
    
    reason = `Basic strategy + ${trueCount > 0 ? '+' : ''}${trueCount} count`;
    
  } else if (action === 'stand') {
    explanation = `Standing with ${playerValue} is the optimal play. `;
    
    if (playerValue >= 17) {
      const dealerBustProb = getDealerBustProbability(dealerUpCard);
      explanation += `Dealer has ${(dealerBustProb * 100).toFixed(0)}% chance to bust with ${dealerUpCard} showing. `;
      explanation += `Hitting risks busting your strong hand.`;
    } else {
      explanation += `Dealer's ${dealerUpCard} is strong enough that hitting would put you at too much risk. `;
      explanation += `Standing gives you the best mathematical expectation.`;
    }
    
    if (trueCount > 1) {
      explanation += ` The positive count of +${trueCount} ${countImpact} favors standing.`;
    }
    
    reason = `Optimal expectation at ${playerValue} vs ${dealerUpCard}`;
    
  } else if (action === 'double') {
    const doubleAdvantage = calculateDoubleAdvantage(playerValue, dealerUpCard, trueCount);
    
    explanation = `Doubling down maximizes your expected value here. `;
    explanation += `Your ${playerValue} has strong potential against dealer's ${dealerUpCard}. `;
    explanation += `One more card gives you a ${doubleAdvantage.toFixed(1)}% advantage over just hitting. `;
    
    if (trueCount > 1) {
      explanation += `The count of +${trueCount} makes this even more favorable - more 10s in the deck!`;
    } else {
      explanation += `This is a textbook doubling situation based on probability theory.`;
    }
    
    reason = `Maximum EV with ${playerValue} vs dealer ${dealerUpCard}`;
    
  } else if (action === 'split') {
    const pairCard = playerHand.cards[0].rank;
    
    explanation = `Splitting ${pairCard}s is statistically superior to playing as ${playerValue}. `;
    
    if (pairCard === 'A') {
      explanation += `Two chances at 21 is far better than soft ${playerValue}. Each Ace starts a new hand with 11.`;
    } else if (pairCard === '8') {
      explanation += `16 is the worst hand. Splitting gives you two chances to beat dealer's ${dealerUpCard}.`;
    } else {
      explanation += `Two hands starting at ${playerHand.cards[0].value} each have better probability than one hand at ${playerValue}.`;
    }
    
    if (trueCount > 2) {
      explanation += ` With count at +${trueCount}, you're even more likely to get high cards!`;
    }
    
    reason = `Pair splitting maximizes win probability`;
    
  } else if (action === 'surrender') {
    explanation = `This is a losing situation. Surrendering minimizes your loss to 50% of your bet. `;
    explanation += `Your ${playerValue} against dealer's ${dealerUpCard} has less than 25% win probability. `;
    explanation += `Statistically, you'll lose more money playing this hand than surrendering.`;
    
    reason = `Loss minimization - win probability below 25%`;
  }
  
  return {
    action,
    winProbability,
    reason,
    explanation
  };
};

const getDealerBustProbability = (dealerUpCard: number): number => {
  const bustProb: { [key: number]: number } = {
    2: 0.35, 3: 0.37, 4: 0.40, 5: 0.42, 6: 0.42,
    7: 0.26, 8: 0.24, 9: 0.23, 10: 0.23, 11: 0.17
  };
  return bustProb[dealerUpCard] || 0.23;
};

const calculateDoubleAdvantage = (playerValue: number, dealerUpCard: number, trueCount: number): number => {
  let advantage = 0;
  
  if (playerValue === 11) advantage = 65;
  else if (playerValue === 10) advantage = 55;
  else if (playerValue === 9) advantage = 35;
  else advantage = 20;
  
  // Weak dealer cards increase advantage
  if (dealerUpCard >= 4 && dealerUpCard <= 6) advantage += 15;
  
  // True count adjustment
  advantage += trueCount * 5;
  
  return advantage;
};
