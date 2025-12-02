import { Hand } from './types';
import { getBasicStrategy } from './strategy';
import { calculateWinProbability } from './probability';

interface AgentRecommendation {
  action: 'hit' | 'stand' | 'double' | 'split';
  winProbability: number;
  reason: string;
  explanation: string;
  cardCountingLesson: string;
  strategyTip: string;
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
  let action = strategy.action;
  
  // Filter out surrender
  if (action === 'surrender') {
    action = 'hit';
  }
  
  const winProbability = calculateWinProbability(playerHand, dealerUpCard, trueCount, action);
  
  const playerValue = playerHand.value;
  const isSoft = playerHand.isSoft;
  const isPair = playerHand.cards.length === 2 && playerHand.cards[0].rank === playerHand.cards[1].rank;
  
  // Generate detailed educational content
  let explanation = '';
  let reason = '';
  let cardCountingLesson = '';
  let strategyTip = '';
  
  // Card counting education based on current count
  if (trueCount >= 3) {
    cardCountingLesson = `TRUE COUNT +${trueCount}: The deck is "hot" - rich in 10s, Jacks, Queens, Kings, and Aces. This favors YOU because: (1) You're more likely to hit blackjack (3:2 payout), (2) Dealer busts more often when forced to hit, (3) Double downs are more profitable. Professional counters increase bets now.`;
  } else if (trueCount >= 1) {
    cardCountingLesson = `TRUE COUNT +${trueCount}: Slightly favorable deck. More high cards (10-A) remain than low cards (2-6). The Hi-Lo system assigns: +1 to low cards (2-6), 0 to neutral (7-9), -1 to high cards (10-A). When you see low cards dealt, the count goes UP, meaning more high cards remain.`;
  } else if (trueCount <= -3) {
    cardCountingLesson = `TRUE COUNT ${trueCount}: The deck is "cold" - rich in low cards. This favors the DEALER because: (1) Dealer won't bust as often, (2) Your doubles/blackjacks are less likely, (3) You should bet minimum and play conservatively. Professionals would sit out or leave.`;
  } else if (trueCount <= -1) {
    cardCountingLesson = `TRUE COUNT ${trueCount}: Slightly unfavorable. More high cards have been dealt, leaving low cards in the deck. Remember: Running Count ÷ Decks Remaining = True Count. The true count normalizes for multi-deck games.`;
  } else {
    cardCountingLesson = `TRUE COUNT 0: Neutral deck - no significant advantage either way. This is your baseline. Start counting: every 2-6 = +1, every 10/J/Q/K/A = -1, 7-8-9 = 0. Track the running count, then divide by remaining decks for true count.`;
  }

  // Action-specific explanations with strategy education
  if (action === 'hit') {
    const bustRisk = Math.max(0, (playerValue - 11) / 10 * 100);
    
    if (playerValue <= 11) {
      explanation = `With ${playerValue}, you CANNOT bust! Any card improves your hand. This is a "no-risk" hit situation.`;
      strategyTip = `RULE: Always hit hard 11 or less. You can only improve - mathematically impossible to bust.`;
    } else if (playerValue <= 16 && dealerUpCard >= 7) {
      explanation = `Your ${playerValue} loses to dealer's likely 17+ (showing ${dealerUpCard}). Hitting risks ${bustRisk.toFixed(0)}% bust, but standing almost guarantees a loss.`;
      strategyTip = `RULE: Hit 12-16 vs dealer 7-A. The dealer's strong upcard means they'll likely make 17+. You must take the risk.`;
    } else {
      explanation = `Against dealer's ${dealerUpCard}, your ${playerValue} needs improvement. ${isSoft ? 'Soft hands are flexible - the Ace can be 1 or 11.' : `Bust risk: ${bustRisk.toFixed(0)}%`}`;
      strategyTip = isSoft ? `RULE: Soft hands (with Ace) are powerful - hit aggressively since you can't bust with one card.` : `RULE: When your expected loss from standing exceeds bust risk, hitting is correct.`;
    }
    
    reason = `Basic Strategy + Count ${trueCount > 0 ? '+' : ''}${trueCount}`;
    
  } else if (action === 'stand') {
    const dealerBustProb = getDealerBustProbability(dealerUpCard);
    
    if (dealerUpCard >= 2 && dealerUpCard <= 6) {
      explanation = `Dealer shows ${dealerUpCard} (a "bust card"). They have ${(dealerBustProb * 100).toFixed(0)}% chance to bust. Your ${playerValue} doesn't need to improve - let the dealer take the risk!`;
      strategyTip = `RULE: Stand on 12+ vs dealer 4-6, stand on 13+ vs dealer 2-3. Dealer must hit to 17, so weak upcards often lead to busts.`;
    } else if (playerValue >= 17) {
      explanation = `Your ${playerValue} is strong. Hitting risks busting, and you already beat many dealer outcomes. The math says stop here.`;
      strategyTip = `RULE: Always stand on hard 17+. Even if dealer shows 10 or Ace, busting yourself is worse than letting them beat you.`;
    } else {
      explanation = `Standing with ${playerValue} against dealer's ${dealerUpCard}. While not ideal, hitting has higher expected loss due to bust risk.`;
      strategyTip = `This is a defensive stand - sometimes the best play is minimizing losses, not maximizing wins.`;
    }
    
    if (trueCount > 2) {
      explanation += ` The +${trueCount} count means more 10s remain - dealer is MORE likely to bust!`;
    }
    
    reason = `Dealer bust probability ${(dealerBustProb * 100).toFixed(0)}%`;
    
  } else if (action === 'double') {
    const doubleAdvantage = calculateDoubleAdvantage(playerValue, dealerUpCard, trueCount);
    
    if (playerValue === 11) {
      explanation = `11 is the BEST double down! One card puts you at 12-21. Against ${dealerUpCard}, you're heavily favored. Doubling your bet here has maximum expected value.`;
      strategyTip = `RULE: Always double on 11 (except vs Ace in some games). It's the most profitable play in blackjack.`;
    } else if (playerValue === 10) {
      explanation = `10 is excellent for doubling against dealer's weak ${dealerUpCard}. You'll likely hit 17-21, while dealer struggles.`;
      strategyTip = `RULE: Double 10 vs dealer 2-9. Don't double vs 10 or Ace - they're too strong.`;
    } else if (playerValue === 9) {
      explanation = `9 doubles best against dealer's very weak cards (3-6). One card likely gives you 15-19, competitive against a struggling dealer.`;
      strategyTip = `RULE: Double 9 vs dealer 3-6 only. Against 2, 7-A, the dealer is too likely to make a good hand.`;
    } else if (isSoft) {
      explanation = `Soft ${playerValue} (Ace counts as 11) is flexible. Double to maximize value against dealer's weak ${dealerUpCard}.`;
      strategyTip = `RULE: Double soft 13-17 vs dealer 5-6, soft 15-17 vs dealer 4, soft 17 vs dealer 3. The Ace protects you from busting.`;
    }
    
    if (trueCount > 1) {
      explanation += ` Count +${trueCount} makes this even better - more 10s to draw!`;
    }
    
    reason = `+${doubleAdvantage.toFixed(0)}% EV advantage over hitting`;
    
  } else if (action === 'split') {
    const pairCard = playerHand.cards[0].rank;
    
    if (pairCard === 'A') {
      explanation = `ALWAYS split Aces! Two chances at 21 beats playing soft 12. Each Ace becomes a powerful starting hand.`;
      strategyTip = `RULE: Split Aces against ANY dealer card. This is non-negotiable - it's one of the most valuable plays.`;
    } else if (pairCard === '8') {
      explanation = `ALWAYS split 8s! 16 is the worst hand in blackjack. Two 8s give you two chances at 18+ instead of likely busting.`;
      strategyTip = `RULE: Split 8s against ANY dealer card. 16 is so bad that even splitting vs dealer 10 is correct.`;
    } else if (['2', '3', '7'].includes(pairCard)) {
      explanation = `Split ${pairCard}s against dealer's weak ${dealerUpCard}. Two mediocre hands beat one bad hand when dealer likely busts.`;
      strategyTip = `RULE: Split 2s, 3s, 7s vs dealer 2-7. Don't split vs strong dealer cards.`;
    } else if (pairCard === '6') {
      explanation = `Split 6s against dealer's weak ${dealerUpCard}. 12 is tough to play; two 6s have better potential.`;
      strategyTip = `RULE: Split 6s vs dealer 2-6. Against 7+, hit the 12 instead.`;
    } else if (pairCard === '9') {
      explanation = `Split 9s against dealer ${dealerUpCard}. While 18 is decent, two 9s can each become 19 when dealer shows weakness.`;
      strategyTip = `RULE: Split 9s vs 2-6 and 8-9. Stand on 18 vs 7 (dealer likely 17). Stand vs 10/A.`;
    } else if (pairCard === '4') {
      explanation = `Split 4s (if you can double after). Two 4s can become 14-24, but a single hit on 8 is safe too.`;
      strategyTip = `RULE: Only split 4s vs dealer 5-6 IF you can double after split. Otherwise treat as 8.`;
    }
    
    reason = `Two hands beat one bad hand`;
  }
  
  return {
    action,
    winProbability,
    reason,
    explanation,
    cardCountingLesson,
    strategyTip
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
