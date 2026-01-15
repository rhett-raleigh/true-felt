"use client";

import type { GameState } from "@/app/types/game";
import Hand from "./Hand";
import GameControls from "./GameControls";
import StrategyHint from "./StrategyHint";
import type { StrategyRecommendation } from "@/app/types/game";

interface GameTableProps {
  gameState: GameState;
  onAction: (action: string) => void;
  recommendation?: StrategyRecommendation;
  disabled?: boolean;
}

export default function GameTable({
  gameState,
  onAction,
  recommendation,
  disabled = false,
}: GameTableProps) {
  const currentHand = gameState.playerHands[gameState.activeHandIndex];
  const showDealerCard =
    gameState.phase === "dealer-turn" ||
    gameState.phase === "result" ||
    gameState.phase === "game-over";

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-4xl mx-auto p-2 sm:p-4">
      {/* Dealer Section */}
      <div className="flex flex-col items-center gap-4">
        <Hand
          hand={gameState.dealerHand}
          label="Dealer"
          faceDown={!showDealerCard}
        />
        {gameState.dealerUpCard && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Up Card: {gameState.dealerUpCard.rank} {gameState.dealerUpCard.suit}
          </div>
        )}
      </div>

      {/* Strategy Hint */}
      {gameState.phase === "player-turn" && recommendation && (
        <StrategyHint recommendation={recommendation} />
      )}

      {/* Player Hands Section */}
      <div className="flex flex-col gap-4">
        {gameState.playerHands.map((hand, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Hand
              hand={hand}
              label={
                gameState.playerHands.length > 1
                  ? `Hand ${index + 1}`
                  : "Your Hand"
              }
              isActive={
                index === gameState.activeHandIndex &&
                gameState.phase === "player-turn"
              }
            />
            {hand.isBust && (
              <div className="text-red-600 dark:text-red-400 font-semibold">
                Bust!
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Game Controls */}
      {gameState.phase === "player-turn" && (
        <div className="flex flex-col items-center gap-4">
          <GameControls
            currentHand={currentHand}
            onAction={(action) => onAction(action)}
            recommendation={recommendation}
            disabled={disabled}
          />
        </div>
      )}

      {/* Result Display */}
      {gameState.phase === "game-over" && gameState.result && (
        <div className="text-center p-6 rounded-lg bg-gray-100 dark:bg-gray-800">
          <div className="text-2xl font-bold mb-2">
            {gameState.result === "win" && (
              <span className="text-green-600 dark:text-green-400">
                You Win!
              </span>
            )}
            {gameState.result === "loss" && (
              <span className="text-red-600 dark:text-red-400">You Lose</span>
            )}
            {gameState.result === "push" && (
              <span className="text-yellow-600 dark:text-yellow-400">
                Push (Tie)
              </span>
            )}
            {gameState.result === "blackjack" && (
              <span className="text-green-600 dark:text-green-400">
                Blackjack! 🎉
              </span>
            )}
          </div>
          {gameState.winnings !== 0 && (
            <div className="text-lg">
              {gameState.winnings > 0 ? "+" : ""}
              {gameState.winnings.toLocaleString()} chips
            </div>
          )}
        </div>
      )}
    </div>
  );
}
