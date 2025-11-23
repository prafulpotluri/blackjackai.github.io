export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

export interface Hand {
  cards: Card[];
  value: number;
  isSoft: boolean;
  isBusted: boolean;
  isBlackjack: boolean;
}

export interface GameState {
  deck: Card[];
  playerHands: Hand[];
  dealerHand: Hand;
  currentHandIndex: number;
  balance: number;
  currentBet: number;
  gamePhase: 'betting' | 'playing' | 'dealer' | 'finished';
  runningCount: number;
  trueCount: number;
  decksRemaining: number;
  message: string;
}

export interface AgentAdvice {
  action: 'hit' | 'stand' | 'double' | 'split' | 'surrender';
  winProbability: number;
  reason: string;
  explanation: string;
}

export interface BasicStrategyDecision {
  action: 'hit' | 'stand' | 'double' | 'split' | 'surrender';
  alternative?: 'hit' | 'stand';
}
