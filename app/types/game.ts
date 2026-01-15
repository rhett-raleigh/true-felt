// Card and Suit types
export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // Numeric value for calculations (A can be 1 or 11)
}

// Hand evaluation
export interface Hand {
  cards: Card[];
  total: number; // Best total (Ace as 11 if possible)
  softTotal: number; // Total with Ace as 1
  isSoft: boolean; // Has usable Ace
  isBlackjack: boolean; // 21 with 2 cards
  isBust: boolean; // Over 21
  canSplit: boolean; // First two cards are same rank
  canDouble: boolean; // Can double down
}

// Game actions
export type GameAction =
  | "hit"
  | "stand"
  | "double"
  | "split"
  | "surrender"
  | "insurance";

// Strategy recommendation
export interface StrategyRecommendation {
  action: GameAction;
  reason: string;
  isOptimal: boolean;
}

// Game state
export type GamePhase =
  | "betting"
  | "dealing"
  | "player-turn"
  | "dealer-turn"
  | "result"
  | "game-over";

export interface GameState {
  phase: GamePhase;
  playerHands: Hand[]; // Array for split hands
  activeHandIndex: number; // Which hand is currently being played
  dealerHand: Hand;
  dealerUpCard: Card | null;
  currentBet: number; // Original bet amount per hand
  handBets: number[]; // Bet amount for each hand (accounts for doubles)
  totalBet: number; // Sum of all bets (including splits and doubles)
  result: "win" | "loss" | "push" | "blackjack" | null;
  winnings: number;
  deck: Card[];
  deckIndex: number; // Current position in deck
}

// Currency and storage
export interface CurrencyState {
  balance: number;
  lastDailyBonus: number | null; // Timestamp
}

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  pushes: number;
  blackjacks: number;
  strategyFollowed: number;
  strategyDeviated: number;
}

export interface StoredData {
  currency: CurrencyState;
  stats: GameStats;
  settings: {
    hintsEnabled: boolean;
    soundEnabled: boolean;
  };
}

// Game rules configuration
export interface GameRules {
  numDecks: number;
  dealerStandsOnSoft17: boolean;
  doubleAfterSplit: boolean;
  maxSplits: number;
  blackjackPayout: number; // 1.5 for 3:2
  insuranceAvailable: boolean;
  surrenderAvailable: boolean;
}
