"use client";

import { useState, useEffect } from "react";
import { getBalance, isDailyBonusAvailable } from "@/app/lib/storage";
import { formatChips, getFormattedTimeUntilBonus } from "@/app/lib/currency";
import DailyBonus from "./DailyBonus";

interface CurrencyDisplayProps {
  onBalanceChange?: (newBalance: number) => void;
  showDailyBonus?: boolean;
}

export default function CurrencyDisplay({
  onBalanceChange,
  showDailyBonus = true,
}: CurrencyDisplayProps) {
  const [balance, setBalance] = useState(getBalance());
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusAvailable, setBonusAvailable] = useState(isDailyBonusAvailable());

  useEffect(() => {
    // Check for balance changes
    const interval = setInterval(() => {
      const newBalance = getBalance();
      if (newBalance !== balance) {
        setBalance(newBalance);
        onBalanceChange?.(newBalance);
      }
      setBonusAvailable(isDailyBonusAvailable());
    }, 1000);

    return () => clearInterval(interval);
  }, [balance, onBalanceChange]);

  const handleBonusClaimed = () => {
    const newBalance = getBalance();
    setBalance(newBalance);
    onBalanceChange?.(newBalance);
    setBonusAvailable(false);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Balance
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {formatChips(balance)}
          </div>
        </div>
        {showDailyBonus && (
          <button
            onClick={() => setShowBonusModal(true)}
            className={`
              px-4 py-2 rounded-lg font-semibold text-sm
              transition-colors min-h-[44px]
              ${
                bonusAvailable
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }
            `}
          >
            {bonusAvailable ? (
              "🎁 Daily Bonus"
            ) : (
              <span className="text-xs">{getFormattedTimeUntilBonus()}</span>
            )}
          </button>
        )}
      </div>

      {showBonusModal && (
        <DailyBonus
          onClaimed={handleBonusClaimed}
          onClose={() => setShowBonusModal(false)}
        />
      )}
    </>
  );
}
