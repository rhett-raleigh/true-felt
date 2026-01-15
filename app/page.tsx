'use client';

import Link from 'next/link';
import CurrencyDisplay from './components/CurrencyDisplay';
import { useGame } from './context/GameContext';
import { useEffect } from 'react';
import { checkAndClaimDailyBonus } from './lib/currency';

export default function Home() {
  const { balance, refreshBalance } = useGame();

  useEffect(() => {
    // Check for daily bonus on mount
    const { claimed } = checkAndClaimDailyBonus();
    if (claimed) {
      refreshBalance();
    }
  }, [refreshBalance]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 to-green-700 dark:from-green-950 dark:to-green-900 p-4">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-8 py-16 px-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            🃏 Blackjack Strategy
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-green-100 mb-8 px-4">
            Learn optimal "by the book" blackjack strategy through interactive gameplay
          </p>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex flex-col items-center gap-6">
            <CurrencyDisplay onBalanceChange={refreshBalance} showDailyBonus={true} />

            <div className="w-full border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white text-center">
                How to Play
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>Place your bet and receive strategy hints during gameplay</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>Follow basic strategy recommendations to maximize your winnings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>Claim your daily bonus to boost your chip balance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>Learn optimal play through real-time feedback</span>
                </li>
              </ul>
            </div>

            <Link
              href="/game"
              className="w-full py-4 rounded-lg font-bold text-xl bg-green-600 text-white hover:bg-green-700 active:bg-green-800 transition-colors text-center min-h-[56px] flex items-center justify-center"
            >
              Play Now
            </Link>
          </div>
        </div>

        <div className="text-center text-green-100 text-sm">
          <p>Master blackjack strategy and see how following the book affects your results</p>
        </div>
      </main>
    </div>
  );
}
