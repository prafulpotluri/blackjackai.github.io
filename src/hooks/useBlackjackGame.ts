import { create } from 'zustand';
import { GameState, Hand, AgentAdvice } from '@/lib/blackjack/types';
import { createShoe, dealCard } from '@/lib/blackjack/deck';
import { createHand, canSplit as checkCanSplit, canDoubleDown } from '@/lib/blackjack/handCalculator';
import { 
  updateRunningCount, 
  calculateTrueCount, 
  calculateDecksRemaining 
} from '@/lib/blackjack/cardCounting';
import { getBasicStrategy } from '@/lib/blackjack/strategy';
import { calculateWinProbability } from '@/lib/blackjack/probability';

interface BlackjackStore extends GameState {
  placeBet: (amount: number) => void;
  dealInitial: () => void;
  hit: () => void;
  stand: () => void;
  double: () => void;
  split: () => void;
  surrender: () => void;
  getAgentAdvice: () => Promise<AgentAdvice | null>;
  resetGame: () => void;
}

const initialState: GameState = {
  deck: createShoe(6),
  playerHands: [],
  dealerHand: createHand([]),
  currentHandIndex: 0,
  balance: 1000,
  currentBet: 0,
  gamePhase: 'betting',
  runningCount: 0,
  trueCount: 0,
  decksRemaining: 6,
  message: 'Place your bet to start!'
};

export const useBlackjackGame = create<BlackjackStore>((set, get) => ({
  ...initialState,

  placeBet: (amount: number) => {
    const state = get();
    if (amount > state.balance) return;
    
    set({ 
      currentBet: amount, 
      balance: state.balance - amount,
      message: 'Dealing cards...'
    });
    
    setTimeout(() => get().dealInitial(), 500);
  },

  dealInitial: () => {
    let state = get();
    let { deck, runningCount } = state;
    
    // Deal cards
    const cards = [];
    for (let i = 0; i < 4; i++) {
      const { card, remainingDeck } = dealCard(deck);
      cards.push(card);
      deck = remainingDeck;
      if (i !== 1) { // Don't count dealer's hidden card yet
        runningCount = updateRunningCount(runningCount, card);
      }
    }
    
    const playerHand = createHand([cards[0], cards[2]]);
    const dealerHand = createHand([cards[1], cards[3]]);
    
    const decksRemaining = calculateDecksRemaining(deck.length);
    const trueCount = calculateTrueCount(runningCount, decksRemaining);
    
    set({
      deck,
      playerHands: [playerHand],
      dealerHand: { ...dealerHand, cards: [dealerHand.cards[0]] }, // Hide second card
      currentHandIndex: 0,
      runningCount,
      trueCount,
      decksRemaining,
      gamePhase: 'playing',
      message: playerHand.isBlackjack ? 'Blackjack! You win!' : 'Your turn - check the advice!'
    });
    
    // Auto-finish if blackjack
    if (playerHand.isBlackjack) {
      setTimeout(() => {
        set({ 
          gamePhase: 'finished',
          balance: get().balance + get().currentBet * 2.5
        });
      }, 1500);
    }
  },

  hit: () => {
    let state = get();
    const { card, remainingDeck } = dealCard(state.deck);
    
    const newHands = [...state.playerHands];
    const currentHand = newHands[state.currentHandIndex];
    const updatedHand = createHand([...currentHand.cards, card]);
    newHands[state.currentHandIndex] = updatedHand;
    
    const newRunningCount = updateRunningCount(state.runningCount, card);
    const decksRemaining = calculateDecksRemaining(remainingDeck.length);
    const newTrueCount = calculateTrueCount(newRunningCount, decksRemaining);
    
    if (updatedHand.isBusted) {
      set({
        deck: remainingDeck,
        playerHands: newHands,
        runningCount: newRunningCount,
        trueCount: newTrueCount,
        decksRemaining,
        gamePhase: 'finished',
        message: 'Busted! Dealer wins.'
      });
    } else {
      set({
        deck: remainingDeck,
        playerHands: newHands,
        runningCount: newRunningCount,
        trueCount: newTrueCount,
        decksRemaining,
        message: 'Hit or stand?'
      });
    }
  },

  stand: () => {
    set({ gamePhase: 'dealer', message: 'Dealer playing...' });
    
    setTimeout(() => {
      let state = get();
      let { deck, dealerHand, runningCount } = state;
      
      // Reveal hidden card and count it
      const fullDealerHand = createHand(state.dealerHand.cards);
      runningCount = updateRunningCount(runningCount, dealerHand.cards[0]);
      
      let currentDealerHand = fullDealerHand;
      
      // Dealer hits on 16 or less, stands on 17+
      while (currentDealerHand.value < 17) {
        const { card, remainingDeck } = dealCard(deck);
        deck = remainingDeck;
        runningCount = updateRunningCount(runningCount, card);
        currentDealerHand = createHand([...currentDealerHand.cards, card]);
      }
      
      const playerHand = state.playerHands[0];
      let result = '';
      let payout = 0;
      
      if (currentDealerHand.isBusted) {
        result = 'Dealer busts! You win!';
        payout = state.currentBet * 2;
      } else if (playerHand.value > currentDealerHand.value) {
        result = 'You win!';
        payout = state.currentBet * 2;
      } else if (playerHand.value < currentDealerHand.value) {
        result = 'Dealer wins.';
      } else {
        result = 'Push - bet returned.';
        payout = state.currentBet;
      }
      
      const decksRemaining = calculateDecksRemaining(deck.length);
      const trueCount = calculateTrueCount(runningCount, decksRemaining);
      
      set({
        deck,
        dealerHand: currentDealerHand,
        runningCount,
        trueCount,
        decksRemaining,
        balance: state.balance + payout,
        gamePhase: 'finished',
        message: result
      });
    }, 1500);
  },

  double: () => {
    const state = get();
    const { card, remainingDeck } = dealCard(state.deck);
    
    const newHands = [...state.playerHands];
    const currentHand = newHands[state.currentHandIndex];
    const updatedHand = createHand([...currentHand.cards, card]);
    newHands[state.currentHandIndex] = updatedHand;
    
    const newRunningCount = updateRunningCount(state.runningCount, card);
    const decksRemaining = calculateDecksRemaining(remainingDeck.length);
    const newTrueCount = calculateTrueCount(newRunningCount, decksRemaining);
    
    set({
      deck: remainingDeck,
      playerHands: newHands,
      runningCount: newRunningCount,
      trueCount: newTrueCount,
      decksRemaining,
      balance: state.balance - state.currentBet,
      currentBet: state.currentBet * 2,
      message: 'Doubled down!'
    });
    
    if (updatedHand.isBusted) {
      set({ gamePhase: 'finished', message: 'Busted! Dealer wins.' });
    } else {
      setTimeout(() => get().stand(), 1000);
    }
  },

  split: () => {
    // Simplified split - just for the basic case
    const state = get();
    const hand = state.playerHands[0];
    
    const { card: card1, remainingDeck: deck1 } = dealCard(state.deck);
    const { card: card2, remainingDeck: deck2 } = dealCard(deck1);
    
    const hand1 = createHand([hand.cards[0], card1]);
    const hand2 = createHand([hand.cards[1], card2]);
    
    let newRunningCount = updateRunningCount(state.runningCount, card1);
    newRunningCount = updateRunningCount(newRunningCount, card2);
    
    const decksRemaining = calculateDecksRemaining(deck2.length);
    const newTrueCount = calculateTrueCount(newRunningCount, decksRemaining);
    
    set({
      deck: deck2,
      playerHands: [hand1, hand2],
      runningCount: newRunningCount,
      trueCount: newTrueCount,
      decksRemaining,
      balance: state.balance - state.currentBet,
      message: 'Split! Playing first hand...'
    });
  },

  surrender: () => {
    const state = get();
    set({
      gamePhase: 'finished',
      balance: state.balance + (state.currentBet * 0.5),
      message: 'Surrendered. Half bet returned.'
    });
  },

  getAgentAdvice: async () => {
    const state = get();
    if (state.gamePhase !== 'playing') return null;
    
    const playerHand = state.playerHands[state.currentHandIndex];
    const dealerUpCard = state.dealerHand.cards[0].value;
    
    const canSplit = checkCanSplit(playerHand);
    const canDouble = canDoubleDown(playerHand, state.balance, state.currentBet);
    
    // Use pure algorithmic recommendation
    const { getAgentRecommendation } = await import('@/lib/blackjack/agentAlgorithm');
    
    return getAgentRecommendation(
      playerHand,
      dealerUpCard,
      state.trueCount,
      canSplit,
      canDouble,
      state.balance,
      state.currentBet
    );
  },

  resetGame: () => {
    const state = get();
    // Reshuffle if less than 1 deck remaining
    const newDeck = state.decksRemaining < 1 ? createShoe(6) : state.deck;
    
    set({
      deck: newDeck,
      playerHands: [],
      dealerHand: createHand([]),
      currentHandIndex: 0,
      currentBet: 0,
      gamePhase: 'betting',
      runningCount: state.decksRemaining < 1 ? 0 : state.runningCount,
      trueCount: state.decksRemaining < 1 ? 0 : state.trueCount,
      decksRemaining: state.decksRemaining < 1 ? 6 : state.decksRemaining,
      message: 'Place your bet!'
    });
  }
}));
