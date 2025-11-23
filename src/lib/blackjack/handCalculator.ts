import { Card, Hand } from './types';

export const calculateHandValue = (cards: Card[]): { value: number; isSoft: boolean } => {
  let value = 0;
  let aces = 0;
  
  for (const card of cards) {
    if (card.rank === 'A') {
      aces++;
      value += 11;
    } else {
      value += card.value;
    }
  }
  
  let isSoft = aces > 0;
  
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
    isSoft = aces > 0;
  }
  
  return { value, isSoft };
};

export const createHand = (cards: Card[]): Hand => {
  const { value, isSoft } = calculateHandValue(cards);
  return {
    cards,
    value,
    isSoft,
    isBusted: value > 21,
    isBlackjack: cards.length === 2 && value === 21
  };
};

export const canSplit = (hand: Hand): boolean => {
  return hand.cards.length === 2 && hand.cards[0].rank === hand.cards[1].rank;
};

export const canDoubleDown = (hand: Hand, balance: number, bet: number): boolean => {
  return hand.cards.length === 2 && balance >= bet;
};
