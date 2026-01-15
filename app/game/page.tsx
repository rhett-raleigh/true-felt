'use client';

import { useState } from 'react';
import { useGame } from '@/app/context/GameContext';
import GameTable from '@/app/components/GameTable';
import BettingControls from '@/app/components/BettingControls';
import CurrencyDisplay from '@/app/components/CurrencyDisplay';
import Link from 'next/link';
import { getMinBet } from '@/app/lib/currency';

export default function GamePage() {
  const { gameState, balance, recommendation, startGame, makeMove, endGame, refreshBalance } = useGame();
  const [currentBet, setCurrentBet] = useState(Math.min(100, balance));

  const handleBetConfirm = (bet: number) => {
    if (typeof bet !== 'number' || isNaN(bet)) {
      console.error('Invalid bet amount:', bet);
      return;
    }
    startGame(bet);
  };

  const handleAction = (action: string) => {
    makeMove(action as any);
  };

  const handleNewGame = () => {
    endGame();
    setCurrentBet(Math.min(100, balance));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 dark:from-green-950 dark:to-green-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors min-h-[44px] flex items-center w-full sm:w-auto justify-center sm:justify-start"
          >
            ← Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">Blackjack Strategy</h1>
          <div className="w-full sm:w-auto">
            <CurrencyDisplay onBalanceChange={refreshBalance} showDailyBonus={false} />
          </div>
        </div>

        {/* Game Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          {!gameState || gameState.phase === 'betting' ? (
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  Place Your Bet
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Select your bet amount and start playing
                </p>
              </div>
              <BettingControls
                balance={balance}
                currentBet={currentBet}
                onBetChange={setCurrentBet}
                onConfirm={handleBetConfirm}
                disabled={balance < 10}
              />
            </div>
          ) : gameState.phase === 'game-over' ? (
            <div className="flex flex-col items-center gap-6">
              <GameTable
                gameState={gameState}
                onAction={handleAction}
                recommendation={recommendation}
                disabled={true}
              />
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={handleNewGame}
                  className="px-6 py-3 rounded-lg font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors min-h-[48px] w-full sm:w-auto"
                >
                  New Game
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-lg font-bold text-lg bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 transition-colors min-h-[48px] flex items-center justify-center w-full sm:w-auto"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <GameTable
              gameState={gameState}
              onAction={handleAction}
              recommendation={recommendation}
              disabled={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
