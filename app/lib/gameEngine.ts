import type {
  Card,
  Hand,
  GameState,
  GameRules,
  GameAction,
} from "@/app/types/game";

// Default game rules
export const DEFAULT_RULES: GameRules = {
  numDecks: 6,
  dealerStandsOnSoft17: true,
  doubleAfterSplit: true,
  maxSplits: 4,
  blackjackPayout: 1.5, // 3:2
  insuranceAvailable: true,
  surrenderAvailable: true,
};

// Create a standard 52-card deck
function createDeck(): Card[] {
  const suits: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"];
  const ranks: Card["rank"][] = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      const value =
        rank === "A"
          ? 11
          : rank === "J" || rank === "Q" || rank === "K"
          ? 10
          : parseInt(rank);
      deck.push({ suit, rank, value });
    }
  }

  return deck;
}

// Create a shoe (multiple decks)
export function createShoe(numDecks: number): Card[] {
  const shoe: Card[] = [];
  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createDeck());
  }
  return shuffleDeck(shoe);
}

// Fisher-Yates shuffle
function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Calculate hand value
export function evaluateHand(cards: Card[]): Hand {
  let total = 0;
  let softTotal = 0;
  let aceCount = 0;

  // First pass: count all non-aces
  for (const card of cards) {
    if (card.rank === "A") {
      aceCount++;
    } else {
      total += card.value;
      softTotal += card.value;
    }
  }

  // Add aces
  for (let i = 0; i < aceCount; i++) {
    if (total + 11 <= 21) {
      total += 11;
      softTotal += 1;
    } else {
      total += 1;
      softTotal += 1;
    }
  }

  const isSoft = aceCount > 0 && total !== softTotal && total <= 21;
  const isBlackjack = cards.length === 2 && total === 21;
  const isBust = total > 21;

  // Check if can split (first two cards same rank)
  const canSplit = cards.length === 2 && cards[0].rank === cards[1].rank;

  // Can double if exactly 2 cards
  const canDouble = cards.length === 2;

  return {
    cards: [...cards],
    total,
    softTotal,
    isSoft,
    isBlackjack,
    isBust,
    canSplit,
    canDouble,
  };
}

// Deal a card from the deck
export function dealCard(
  deck: Card[],
  deckIndex: number
): { card: Card; newIndex: number } {
  if (deckIndex >= deck.length) {
    // Reshuffle if needed
    const newDeck = shuffleDeck(deck);
    return { card: newDeck[0], newIndex: 1 };
  }
  return { card: deck[deckIndex], newIndex: deckIndex + 1 };
}

// Initialize a new game
export function initializeGame(
  bet: number,
  rules: GameRules = DEFAULT_RULES
): GameState {
  // Validate bet is a number
  if (typeof bet !== "number" || isNaN(bet) || bet <= 0) {
    console.error("Invalid bet amount:", bet);
    throw new Error(
      `Invalid bet amount: ${bet}. Bet must be a positive number.`
    );
  }

  const deck = createShoe(rules.numDecks);
  let deckIndex = 0;

  // Deal initial cards
  const { card: playerCard1, newIndex: idx1 } = dealCard(deck, deckIndex);
  deckIndex = idx1;
  const { card: dealerCard1, newIndex: idx2 } = dealCard(deck, deckIndex);
  deckIndex = idx2;
  const { card: playerCard2, newIndex: idx3 } = dealCard(deck, deckIndex);
  deckIndex = idx3;
  const { card: dealerCard2, newIndex: idx4 } = dealCard(deck, deckIndex);
  deckIndex = idx4;

  const playerHand = evaluateHand([playerCard1, playerCard2]);
  const dealerHand = evaluateHand([dealerCard1, dealerCard2]);

  // Create initial game state
  let gameState: GameState = {
    phase: "player-turn",
    playerHands: [playerHand],
    activeHandIndex: 0,
    dealerHand,
    dealerUpCard: dealerCard1,
    currentBet: bet,
    handBets: [bet], // Track bet per hand
    totalBet: bet,
    result: null,
    winnings: 0,
    deck,
    deckIndex,
  };

  // Check for immediate blackjack - if so, calculate results immediately
  if (playerHand.isBlackjack || dealerHand.isBlackjack) {
    // Reveal dealer's down card for blackjack scenarios
    gameState.dealerHand = evaluateHand([dealerCard1, dealerCard2]);
    gameState = calculateResults(gameState);
  }

  return gameState;
}

// Hit action
export function hit(gameState: GameState): GameState {
  if (gameState.phase !== "player-turn") {
    return gameState;
  }

  const { card, newIndex } = dealCard(gameState.deck, gameState.deckIndex);
  const currentHand = gameState.playerHands[gameState.activeHandIndex];
  const newHand = evaluateHand([...currentHand.cards, card]);

  const newPlayerHands = [...gameState.playerHands];
  newPlayerHands[gameState.activeHandIndex] = newHand;

  // Check if bust
  if (newHand.isBust) {
    // Move to next hand or dealer turn
    if (gameState.activeHandIndex < newPlayerHands.length - 1) {
      return {
        ...gameState,
        playerHands: newPlayerHands,
        activeHandIndex: gameState.activeHandIndex + 1,
        deckIndex: newIndex,
      };
    } else {
      // All hands done, dealer plays
      return playDealer({
        ...gameState,
        playerHands: newPlayerHands,
        deckIndex: newIndex,
      });
    }
  }

  return {
    ...gameState,
    playerHands: newPlayerHands,
    deckIndex: newIndex,
  };
}

// Stand action
export function stand(gameState: GameState): GameState {
  if (gameState.phase !== "player-turn") {
    return gameState;
  }

  // Move to next hand or dealer turn
  if (gameState.activeHandIndex < gameState.playerHands.length - 1) {
    return {
      ...gameState,
      activeHandIndex: gameState.activeHandIndex + 1,
    };
  } else {
    // All hands done, dealer plays
    return playDealer(gameState);
  }
}

// Double down action
export function doubleDown(gameState: GameState): GameState {
  if (gameState.phase !== "player-turn") {
    return gameState;
  }

  const currentHand = gameState.playerHands[gameState.activeHandIndex];
  if (!currentHand.canDouble) {
    return gameState;
  }

  // Double the bet for this hand
  const doubledBet = gameState.handBets[gameState.activeHandIndex] * 2;
  const newTotalBet =
    gameState.totalBet -
    gameState.handBets[gameState.activeHandIndex] +
    doubledBet;
  const newHandBets = [...gameState.handBets];
  newHandBets[gameState.activeHandIndex] = doubledBet;

  // Deal one card
  const { card, newIndex } = dealCard(gameState.deck, gameState.deckIndex);
  const newHand = evaluateHand([...currentHand.cards, card]);

  const newPlayerHands = [...gameState.playerHands];
  newPlayerHands[gameState.activeHandIndex] = newHand;

  // Move to next hand or dealer turn
  if (gameState.activeHandIndex < newPlayerHands.length - 1) {
    return {
      ...gameState,
      playerHands: newPlayerHands,
      activeHandIndex: gameState.activeHandIndex + 1,
      handBets: newHandBets,
      totalBet: newTotalBet,
      deckIndex: newIndex,
    };
  } else {
    // All hands done, dealer plays
    return playDealer({
      ...gameState,
      playerHands: newPlayerHands,
      handBets: newHandBets,
      totalBet: newTotalBet,
      deckIndex: newIndex,
    });
  }
}

// Split action
export function split(
  gameState: GameState,
  rules: GameRules = DEFAULT_RULES
): GameState {
  if (gameState.phase !== "player-turn") {
    return gameState;
  }

  const currentHand = gameState.playerHands[gameState.activeHandIndex];
  if (
    !currentHand.canSplit ||
    gameState.playerHands.length >= rules.maxSplits
  ) {
    return gameState;
  }

  // Split the hand
  const card1 = currentHand.cards[0];
  const card2 = currentHand.cards[1];

  // Deal two new cards
  const { card: newCard1, newIndex: idx1 } = dealCard(
    gameState.deck,
    gameState.deckIndex
  );
  const { card: newCard2, newIndex: idx2 } = dealCard(gameState.deck, idx1);

  const hand1 = evaluateHand([card1, newCard1]);
  const hand2 = evaluateHand([card2, newCard2]);

  // Add bet for new hand
  const splitBet = gameState.handBets[gameState.activeHandIndex];
  const newTotalBet = gameState.totalBet + splitBet;
  const newHandBets = [...gameState.handBets];
  newHandBets.splice(gameState.activeHandIndex, 1, splitBet, splitBet); // Both hands get the same bet

  // Replace current hand with two hands
  const newPlayerHands = [...gameState.playerHands];
  newPlayerHands.splice(gameState.activeHandIndex, 1, hand1, hand2);

  // If split aces, typically only one card per hand
  // For now, we'll allow normal play after splitting aces

  return {
    ...gameState,
    playerHands: newPlayerHands,
    handBets: newHandBets,
    totalBet: newTotalBet,
    deckIndex: idx2,
  };
}

// Dealer plays according to rules
function playDealer(
  gameState: GameState,
  rules: GameRules = DEFAULT_RULES
): GameState {
  let dealerHand = gameState.dealerHand;
  let deckIndex = gameState.deckIndex;

  // Dealer must hit until 17 or higher
  // If dealerStandsOnSoft17 is true, dealer stands on soft 17
  // Otherwise, dealer hits on soft 17
  while (
    dealerHand.total < 17 ||
    (dealerHand.total === 17 &&
      dealerHand.isSoft &&
      !rules.dealerStandsOnSoft17)
  ) {
    const { card, newIndex } = dealCard(gameState.deck, deckIndex);
    dealerHand = evaluateHand([...dealerHand.cards, card]);
    deckIndex = newIndex;
  }

  // Calculate results
  return calculateResults({
    ...gameState,
    dealerHand,
    deckIndex,
    phase: "result",
  });
}

// Calculate game results
function calculateResults(gameState: GameState): GameState {
  const dealerTotal = gameState.dealerHand.total;
  const dealerBust = gameState.dealerHand.isBust;
  const dealerBlackjack = gameState.dealerHand.isBlackjack;

  let totalWinnings = 0;
  let hasWin = false;
  let hasLoss = false;
  let hasPush = false;
  let hasBlackjack = false;

  // Calculate winnings for each hand using its specific bet
  for (let i = 0; i < gameState.playerHands.length; i++) {
    const playerHand = gameState.playerHands[i];
    const handBet = gameState.handBets[i] || gameState.currentBet; // Fallback to currentBet for safety

    if (playerHand.isBust) {
      // Player busted, loses bet
      hasLoss = true;
      totalWinnings -= handBet;
    } else if (playerHand.isBlackjack && !dealerBlackjack) {
      // Player blackjack pays 3:2
      hasBlackjack = true;
      hasWin = true;
      totalWinnings += Math.floor(handBet * 1.5);
    } else if (dealerBust) {
      // Dealer busted, player wins
      hasWin = true;
      totalWinnings += handBet;
    } else if (dealerBlackjack && !playerHand.isBlackjack) {
      // Dealer blackjack, player loses
      hasLoss = true;
      totalWinnings -= handBet;
    } else if (playerHand.total > dealerTotal) {
      // Player wins
      hasWin = true;
      totalWinnings += handBet;
    } else if (playerHand.total < dealerTotal) {
      // Player loses
      hasLoss = true;
      totalWinnings -= handBet;
    } else {
      // Push (tie)
      hasPush = true;
    }
  }

  let result: GameState["result"] = null;
  if (hasBlackjack) {
    result = "blackjack";
  } else if (hasWin && !hasLoss) {
    result = "win";
  } else if (hasLoss && !hasWin) {
    result = "loss";
  } else if (hasPush || (hasWin && hasLoss)) {
    result = "push";
  }

  return {
    ...gameState,
    winnings: totalWinnings,
    result,
    phase: "game-over",
  };
}

// Execute a game action
export function executeAction(
  gameState: GameState,
  action: GameAction,
  rules: GameRules = DEFAULT_RULES
): GameState {
  switch (action) {
    case "hit":
      return hit(gameState);
    case "stand":
      return stand(gameState);
    case "double":
      return doubleDown(gameState);
    case "split":
      return split(gameState, rules);
    case "surrender":
      // Surrender: lose half the bet for the current hand
      const surrenderHandBet =
        gameState.handBets[gameState.activeHandIndex] || gameState.currentBet;
      return {
        ...gameState,
        phase: "game-over",
        result: "loss",
        winnings: -Math.floor(surrenderHandBet / 2),
      };
    default:
      return gameState;
  }
}
