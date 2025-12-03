import { create } from 'zustand';
import { GameState, Hand, AgentAdvice } from '@/lib/blackjack/types';
import { createShoe, dealCard } from '@/lib/blackjack/deck';
import { createHand, canSplit as checkCanSplit, canDoubleDown } from '@/lib/blackjack/handCalculator';
import { 
  updateRunningCount, 
  calculateTrueCount, 
  calculateDecksRemaining 
} from '@/lib/blackjack/cardCounting';
import { saveHandRecord, HandRecord, initializeSession } from '@/lib/blackjack/gameDataService';

interface BlackjackStore extends GameState {
  actionsTaken: string[];
  initialPlayerValue: number;
  initialDealerUpCard: number;
  initialTrueCount: number;
  initialIsSoft: boolean;
  initialIsPair: boolean;
  pairRank?: string;
  recommendedAction?: string;
  placeBet: (amount: number) => void;
  dealInitial: () => void;
  hit: () => void;
  stand: () => void;
  double: () => void;
  split: () => void;
  getAgentAdvice: () => Promise<AgentAdvice | null>;
  resetGame: () => void;
  setRecommendedAction: (action: string) => void;
}

const initialState: GameState & { 
  actionsTaken: string[]; 
  initialPlayerValue: number;
  initialDealerUpCard: number;
  initialTrueCount: number;
  initialIsSoft: boolean;
  initialIsPair: boolean;
  pairRank?: string;
  recommendedAction?: string;
} = {
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
  message: 'Place your bet to start!',
  actionsTaken: [],
  initialPlayerValue: 0,
  initialDealerUpCard: 0,
  initialTrueCount: 0,
  initialIsSoft: false,
  initialIsPair: false,
  pairRank: undefined,
  recommendedAction: undefined
};

// Initialize session on load
initializeSession().catch(console.error);

export const useBlackjackGame = create<BlackjackStore>((set, get) => ({
  ...initialState,

  setRecommendedAction: (action: string) => {
    set({ recommendedAction: action });
  },

  placeBet: (amount: number) => {
    const state = get();
    if (amount > state.balance) return;
    
    set({ 
      currentBet: amount, 
      balance: state.balance - amount,
      message: 'Dealing cards...',
      actionsTaken: [],
      recommendedAction: undefined
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
    
    const isPair = playerHand.cards.length === 2 && playerHand.cards[0].rank === playerHand.cards[1].rank;
    
    set({
      deck,
      playerHands: [playerHand],
      dealerHand: { ...dealerHand, cards: [dealerHand.cards[0]] }, // Hide second card
      currentHandIndex: 0,
      runningCount,
      trueCount,
      decksRemaining,
      gamePhase: 'playing',
      message: playerHand.isBlackjack ? 'Blackjack! You win!' : 'Your turn - check the advice!',
      actionsTaken: [],
      initialPlayerValue: playerHand.value,
      initialDealerUpCard: dealerHand.cards[0].value,
      initialTrueCount: trueCount,
      initialIsSoft: playerHand.isSoft,
      initialIsPair: isPair,
      pairRank: isPair ? playerHand.cards[0].rank : undefined
    });
    
    // Auto-finish if blackjack
    if (playerHand.isBlackjack) {
      const payout = state.currentBet * 2.5;
      setTimeout(() => {
        const currentState = get();
        set({ 
          gamePhase: 'finished',
          balance: currentState.balance + payout
        });
        
        // Save blackjack hand
        saveHandRecord({
          playerCards: playerHand.cards,
          dealerUpCard: dealerHand.cards[0].value,
          dealerFinalCards: dealerHand.cards,
          playerValue: playerHand.value,
          dealerValue: dealerHand.value,
          isSoft: playerHand.isSoft,
          isPair,
          pairRank: isPair ? playerHand.cards[0].rank : undefined,
          trueCount,
          runningCount,
          actionsTaken: [],
          recommendedAction: currentState.recommendedAction,
          finalResult: 'blackjack',
          betAmount: currentState.currentBet,
          profitLoss: payout - currentState.currentBet,
          wasBlackjack: true
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
    
    const newActions = state.actionsTaken.length === 0 
      ? ['hit'] 
      : [...state.actionsTaken, 'hit'];
    
    if (updatedHand.isBusted) {
      set({
        deck: remainingDeck,
        playerHands: newHands,
        runningCount: newRunningCount,
        trueCount: newTrueCount,
        decksRemaining,
        gamePhase: 'finished',
        message: 'Busted! Dealer wins.',
        actionsTaken: newActions
      });
      
      // Save busted hand
      saveHandRecord({
        playerCards: updatedHand.cards,
        dealerUpCard: state.initialDealerUpCard,
        playerValue: state.initialPlayerValue,
        isSoft: state.initialIsSoft,
        isPair: state.initialIsPair,
        pairRank: state.pairRank,
        trueCount: state.initialTrueCount,
        runningCount: state.runningCount,
        actionsTaken: newActions,
        recommendedAction: state.recommendedAction,
        finalResult: 'lose',
        betAmount: state.currentBet,
        profitLoss: -state.currentBet,
        wasBlackjack: false
      });
    } else {
      set({
        deck: remainingDeck,
        playerHands: newHands,
        runningCount: newRunningCount,
        trueCount: newTrueCount,
        decksRemaining,
        message: 'Hit or stand?',
        actionsTaken: newActions
      });
    }
  },

  stand: () => {
    const state = get();
    const newActions = state.actionsTaken.length === 0 
      ? ['stand'] 
      : [...state.actionsTaken, 'stand'];
    
    set({ 
      gamePhase: 'dealer', 
      message: 'Dealer playing...',
      actionsTaken: newActions 
    });
    
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
      let result: 'win' | 'lose' | 'push' = 'lose';
      let resultMessage = '';
      let payout = 0;
      
      if (currentDealerHand.isBusted) {
        result = 'win';
        resultMessage = 'Dealer busts! You win!';
        payout = state.currentBet * 2;
      } else if (playerHand.value > currentDealerHand.value) {
        result = 'win';
        resultMessage = 'You win!';
        payout = state.currentBet * 2;
      } else if (playerHand.value < currentDealerHand.value) {
        result = 'lose';
        resultMessage = 'Dealer wins.';
      } else {
        result = 'push';
        resultMessage = 'Push - bet returned.';
        payout = state.currentBet;
      }
      
      const decksRemaining = calculateDecksRemaining(deck.length);
      const trueCount = calculateTrueCount(runningCount, decksRemaining);
      
      const profitLoss = payout - state.currentBet;
      
      set({
        deck,
        dealerHand: currentDealerHand,
        runningCount,
        trueCount,
        decksRemaining,
        balance: state.balance + payout,
        gamePhase: 'finished',
        message: resultMessage
      });
      
      // Save completed hand
      saveHandRecord({
        playerCards: playerHand.cards,
        dealerUpCard: state.initialDealerUpCard,
        dealerFinalCards: currentDealerHand.cards,
        playerValue: state.initialPlayerValue,
        dealerValue: currentDealerHand.value,
        isSoft: state.initialIsSoft,
        isPair: state.initialIsPair,
        pairRank: state.pairRank,
        trueCount: state.initialTrueCount,
        runningCount: state.runningCount,
        actionsTaken: state.actionsTaken,
        recommendedAction: state.recommendedAction,
        finalResult: result,
        betAmount: state.currentBet,
        profitLoss,
        wasBlackjack: false
      });
      
      // Auto-continue to betting after 3 seconds
      setTimeout(() => {
        get().resetGame();
      }, 3000);
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
    
    const newActions = ['double'];
    
    set({
      deck: remainingDeck,
      playerHands: newHands,
      runningCount: newRunningCount,
      trueCount: newTrueCount,
      decksRemaining,
      balance: state.balance - state.currentBet,
      currentBet: state.currentBet * 2,
      message: 'Doubled down!',
      actionsTaken: newActions
    });
    
    if (updatedHand.isBusted) {
      const currentState = get();
      set({ gamePhase: 'finished', message: 'Busted! Dealer wins.' });
      
      saveHandRecord({
        playerCards: updatedHand.cards,
        dealerUpCard: state.initialDealerUpCard,
        playerValue: state.initialPlayerValue,
        isSoft: state.initialIsSoft,
        isPair: state.initialIsPair,
        pairRank: state.pairRank,
        trueCount: state.initialTrueCount,
        runningCount: state.runningCount,
        actionsTaken: newActions,
        recommendedAction: state.recommendedAction,
        finalResult: 'lose',
        betAmount: currentState.currentBet,
        profitLoss: -currentState.currentBet,
        wasBlackjack: false
      });
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
      message: 'Split! Playing first hand...',
      actionsTaken: ['split']
    });
  },

  getAgentAdvice: async () => {
    const state = get();
    if (state.gamePhase !== 'playing') return null;
    
    const playerHand = state.playerHands[state.currentHandIndex];
    const dealerUpCard = state.dealerHand.cards[0].value;
    
    const canSplit = checkCanSplit(playerHand);
    const canDouble = canDoubleDown(playerHand, state.balance, state.currentBet);
    
    // Use pure algorithmic recommendation with historical data
    const { getAgentRecommendation } = await import('@/lib/blackjack/agentAlgorithm');
    
    const advice = await getAgentRecommendation(
      playerHand,
      dealerUpCard,
      state.trueCount,
      canSplit,
      canDouble,
      state.balance,
      state.currentBet
    );
    
    // Store recommended action for tracking
    set({ recommendedAction: advice.action });
    
    return advice;
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
      message: 'Place your bet!',
      actionsTaken: [],
      recommendedAction: undefined
    });
  }
}));
