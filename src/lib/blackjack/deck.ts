import { Card, Rank, Suit } from './types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      let value = 0;
      if (rank === 'A') value = 11;
      else if (['J', 'Q', 'K'].includes(rank)) value = 10;
      else value = parseInt(rank);
      
      deck.push({ suit, rank, value });
    }
  }
  return deck;
};

export const createShoe = (numDecks: number = 6): Card[] => {
  const shoe: Card[] = [];
  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createDeck());
  }
  return shuffleDeck(shoe);
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const dealCard = (deck: Card[]): { card: Card; remainingDeck: Card[] } => {
  const newDeck = [...deck];
  const card = newDeck.pop();
  if (!card) throw new Error('Deck is empty');
  return { card, remainingDeck: newDeck };
};
