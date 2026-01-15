"use client";

import type { Hand, GameAction } from "@/app/types/game";
import type { StrategyRecommendation } from "@/app/types/game";

interface GameControlsProps {
  currentHand: Hand;
  onAction: (action: GameAction) => void;
  recommendation?: StrategyRecommendation;
  disabled?: boolean;
}

export default function GameControls({
  currentHand,
  onAction,
  recommendation,
  disabled = false,
}: GameControlsProps) {
  const isOptimalAction = (action: GameAction) => {
    return recommendation?.action === action;
  };

  const getButtonClass = (action: GameAction, baseClass: string) => {
    const isOptimal = isOptimalAction(action);
    const isDisabled = disabled || !canPerformAction(action);

    if (isOptimal) {
      return `${baseClass} ring-2 ring-green-500 ring-offset-2 bg-green-50 dark:bg-green-900/20`;
    }

    if (isDisabled) {
      return `${baseClass} opacity-50 cursor-not-allowed`;
    }

    return baseClass;
  };

  const canPerformAction = (action: GameAction): boolean => {
    switch (action) {
      case "hit":
        return !currentHand.isBust && !currentHand.isBlackjack;
      case "stand":
        return !currentHand.isBust && !currentHand.isBlackjack;
      case "double":
        return currentHand.canDouble && !currentHand.isBust;
      case "split":
        return currentHand.canSplit && !currentHand.isBust;
      case "surrender":
        return currentHand.cards.length === 2 && !currentHand.isBust;
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center w-full">
      <button
        onClick={() => onAction("hit")}
        disabled={disabled || !canPerformAction("hit")}
        className={getButtonClass(
          "hit",
          "px-4 sm:px-6 py-3 rounded-lg font-bold text-base sm:text-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors min-h-[48px] flex-1 sm:flex-initial min-w-[100px]"
        )}
      >
        Hit
      </button>

      <button
        onClick={() => onAction("stand")}
        disabled={disabled || !canPerformAction("stand")}
        className={getButtonClass(
          "stand",
          "px-4 sm:px-6 py-3 rounded-lg font-bold text-base sm:text-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors min-h-[48px] flex-1 sm:flex-initial min-w-[100px]"
        )}
      >
        Stand
      </button>

      {currentHand.canDouble && (
        <button
          onClick={() => onAction("double")}
          disabled={disabled || !canPerformAction("double")}
          className={getButtonClass(
            "double",
            "px-4 sm:px-6 py-3 rounded-lg font-bold text-base sm:text-lg bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 transition-colors min-h-[48px] flex-1 sm:flex-initial min-w-[100px]"
          )}
        >
          Double
        </button>
      )}

      {currentHand.canSplit && (
        <button
          onClick={() => onAction("split")}
          disabled={disabled || !canPerformAction("split")}
          className={getButtonClass(
            "split",
            "px-4 sm:px-6 py-3 rounded-lg font-bold text-base sm:text-lg bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 transition-colors min-h-[48px] flex-1 sm:flex-initial min-w-[100px]"
          )}
        >
          Split
        </button>
      )}

      {currentHand.cards.length === 2 && (
        <button
          onClick={() => onAction("surrender")}
          disabled={disabled || !canPerformAction("surrender")}
          className={getButtonClass(
            "surrender",
            "px-4 sm:px-6 py-3 rounded-lg font-bold text-base sm:text-lg bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 transition-colors min-h-[48px] flex-1 sm:flex-initial min-w-[100px]"
          )}
        >
          Surrender
        </button>
      )}
    </div>
  );
}
