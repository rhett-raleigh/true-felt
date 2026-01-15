"use client";

import { useState } from "react";
import {
  formatChips,
  isValidBet,
  getMaxBet,
  getMinBet,
} from "@/app/lib/currency";

interface BettingControlsProps {
  balance: number;
  currentBet: number;
  onBetChange: (bet: number) => void;
  onConfirm: (bet: number) => void;
  disabled?: boolean;
}

const BET_AMOUNTS = [10, 25, 50, 100, 250, 500, 1000];

export default function BettingControls({
  balance,
  currentBet,
  onBetChange,
  onConfirm,
  disabled = false,
}: BettingControlsProps) {
  const [customBet, setCustomBet] = useState("");

  const maxBet = getMaxBet(balance);
  const minBet = getMinBet(balance);
  const canBet = isValidBet(currentBet, balance) && !disabled;

  const handleCustomBet = (value: string) => {
    const num = parseInt(value) || 0;
    setCustomBet(value);
    if (num >= minBet && num <= maxBet) {
      onBetChange(num);
    }
  };

  const handleQuickBet = (amount: number) => {
    const bet = Math.min(amount, maxBet);
    onBetChange(bet);
    setCustomBet("");
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Place Your Bet
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatChips(currentBet)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Balance: {formatChips(balance)}
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {BET_AMOUNTS.map((amount) => {
          const isDisabled = amount > maxBet || disabled;
          const isSelected = currentBet === amount && amount <= maxBet;
          return (
            <button
              key={amount}
              onClick={() => handleQuickBet(amount)}
              disabled={isDisabled}
              className={`
                px-3 py-2 rounded-lg font-semibold text-sm
                transition-colors min-h-[44px]
                ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : isDisabled
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                }
              `}
            >
              {formatChips(amount)}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          value={customBet}
          onChange={(e) => handleCustomBet(e.target.value)}
          placeholder={`Min: ${minBet}, Max: ${maxBet}`}
          min={minBet}
          max={maxBet}
          disabled={disabled}
          className="
            flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
            min-h-[44px]
          "
        />
        <button
          onClick={() => handleQuickBet(maxBet)}
          disabled={disabled || maxBet === 0}
          className="
            px-4 py-2 rounded-lg font-semibold
            bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white
            hover:bg-gray-300 dark:hover:bg-gray-600
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors min-h-[44px]
          "
        >
          Max
        </button>
      </div>

      <button
        onClick={() => onConfirm(currentBet)}
        disabled={!canBet}
        className="
          w-full py-3 rounded-lg font-bold text-lg
          bg-green-600 text-white
          hover:bg-green-700 active:bg-green-800
          disabled:bg-gray-300 dark:disabled:bg-gray-700
          disabled:text-gray-500 disabled:cursor-not-allowed
          transition-colors min-h-[48px]
        "
      >
        Deal Cards
      </button>
    </div>
  );
}
