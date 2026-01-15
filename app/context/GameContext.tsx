"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type {
  GameState,
  GameAction,
  StrategyRecommendation,
  GameStats,
} from "@/app/types/game";
import {
  initializeGame,
  executeAction,
  DEFAULT_RULES,
} from "@/app/lib/gameEngine";
import { getStrategyRecommendation, isActionOptimal } from "@/app/lib/strategy";
import {
  getBalance,
  updateBalance,
  updateStats,
  getStats,
} from "@/app/lib/storage";
import { applyWinnings } from "@/app/lib/currency";

interface GameContextType {
  gameState: GameState | null;
  balance: number;
  recommendation: StrategyRecommendation | null;
  startGame: (bet: number) => void;
  makeMove: (action: GameAction) => void;
  endGame: () => void;
  refreshBalance: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [balance, setBalance] = useState(getBalance());
  const [recommendation, setRecommendation] =
    useState<StrategyRecommendation | null>(null);

  const refreshBalance = useCallback(() => {
    setBalance(getBalance());
  }, []);

  const handleGameEnd = useCallback((finalState: GameState) => {
    // Update balance with winnings
    const newBalance = applyWinnings(finalState.winnings);
    // Ensure balance is never null/undefined
    setBalance(newBalance ?? getBalance() ?? 10000);

    // Update statistics - accumulate with existing stats
    const currentStats = getStats();
    const statsUpdate: Partial<GameStats> = {
      gamesPlayed: currentStats.gamesPlayed + 1,
    };

    if (finalState.result === "win") {
      statsUpdate.wins = currentStats.wins + 1;
    } else if (finalState.result === "loss") {
      statsUpdate.losses = currentStats.losses + 1;
    } else if (finalState.result === "push") {
      statsUpdate.pushes = currentStats.pushes + 1;
    } else if (finalState.result === "blackjack") {
      statsUpdate.blackjacks = currentStats.blackjacks + 1;
      statsUpdate.wins = currentStats.wins + 1;
    }

    updateStats(statsUpdate);
  }, []);

  const startGame = useCallback(
    (bet: number) => {
      if (bet > balance) {
        return;
      }

      // Deduct bet from balance
      updateBalance(-bet);
      setBalance(getBalance());

      // Initialize game
      const newGameState = initializeGame(bet, DEFAULT_RULES);
      setGameState(newGameState);

      // If game ended immediately (e.g., blackjack), handle results
      if (newGameState.phase === "game-over") {
        handleGameEnd(newGameState);
        setRecommendation(null);
      } else if (
        newGameState.phase === "player-turn" &&
        newGameState.dealerUpCard
      ) {
        // Calculate initial recommendation if player turn
        const currentHand =
          newGameState.playerHands[newGameState.activeHandIndex];
        const rec = getStrategyRecommendation(
          currentHand,
          newGameState.dealerUpCard
        );
        setRecommendation(rec);
      } else {
        setRecommendation(null);
      }
    },
    [balance, handleGameEnd]
  );

  const makeMove = useCallback(
    (action: GameAction) => {
      if (!gameState || gameState.phase !== "player-turn") {
        return;
      }

      const dealerUpCard = gameState.dealerUpCard;

      // Check if action follows strategy
      if (dealerUpCard && recommendation) {
        const optimal = isActionOptimal(action, recommendation);
        const currentStats = getStats();
        updateStats({
          strategyFollowed: currentStats.strategyFollowed + (optimal ? 1 : 0),
          strategyDeviated: currentStats.strategyDeviated + (optimal ? 0 : 1),
        });
      }

      // Execute action
      const newGameState = executeAction(gameState, action, DEFAULT_RULES);
      setGameState(newGameState);

      // Update recommendation for new state
      if (newGameState.phase === "player-turn" && newGameState.dealerUpCard) {
        const newCurrentHand =
          newGameState.playerHands[newGameState.activeHandIndex];
        const rec = getStrategyRecommendation(
          newCurrentHand,
          newGameState.dealerUpCard
        );
        setRecommendation(rec);
      } else {
        setRecommendation(null);
      }

      // If game is over, handle results
      if (newGameState.phase === "game-over") {
        handleGameEnd(newGameState);
      }
    },
    [gameState, recommendation, handleGameEnd]
  );

  const endGame = useCallback(() => {
    setGameState(null);
    setRecommendation(null);
    refreshBalance();
  }, [refreshBalance]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        balance,
        recommendation,
        startGame,
        makeMove,
        endGame,
        refreshBalance,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
