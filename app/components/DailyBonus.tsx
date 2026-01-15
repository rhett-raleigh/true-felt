"use client";

import { useEffect, useState } from "react";
import {
  getTimeUntilNextBonus,
  isDailyBonusAvailable,
  claimDailyBonus,
} from "@/app/lib/storage";
import { formatChips, DAILY_BONUS_AMOUNT } from "@/app/lib/currency";

interface DailyBonusProps {
  onClaimed: () => void;
  onClose: () => void;
}

export default function DailyBonus({ onClaimed, onClose }: DailyBonusProps) {
  const [timeUntil, setTimeUntil] = useState(getTimeUntilNextBonus());
  const [isAvailable, setIsAvailable] = useState(isDailyBonusAvailable());

  useEffect(() => {
    const interval = setInterval(() => {
      const available = isDailyBonusAvailable();
      setIsAvailable(available);
      if (!available) {
        setTimeUntil(getTimeUntilNextBonus());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClaim = () => {
    if (isAvailable) {
      const claimed = claimDailyBonus();
      if (claimed) {
        onClaimed();
        onClose();
      }
    }
  };

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Daily Bonus
        </h2>

        {isAvailable ? (
          <div className="text-center">
            <div className="text-4xl mb-4">🎁</div>
            <div className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Claim Your Daily Bonus!
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-6">
              {formatChips(DAILY_BONUS_AMOUNT)}
            </div>
            <button
              onClick={handleClaim}
              className="w-full py-3 rounded-lg font-bold text-lg bg-green-600 text-white hover:bg-green-700 active:bg-green-800 transition-colors min-h-[48px]"
            >
              Claim Bonus
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-4">⏰</div>
            <div className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Bonus Already Claimed
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Next bonus available in:
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">
              {formatTime(timeUntil)}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors min-h-[44px]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
