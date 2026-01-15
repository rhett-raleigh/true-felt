'use client';

import type { Hand as HandType } from '@/app/types/game';
import Card from './Card';

interface HandProps {
  hand: HandType;
  label?: string;
  faceDown?: boolean;
  isActive?: boolean;
  className?: string;
}

export default function Hand({
  hand,
  label,
  faceDown = false,
  isActive = false,
  className = '',
}: HandProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {label && (
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </div>
      )}
      <div className="flex gap-2 flex-wrap justify-center">
        {hand.cards.map((card, index) => (
          <Card
            key={index}
            card={card}
            faceDown={faceDown && index === 0}
            size="md"
            className={isActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          />
        ))}
      </div>
      <div className="flex gap-4 text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Total: <span className="font-bold">{hand.total}</span>
        </span>
        {hand.isSoft && hand.total !== hand.softTotal && (
          <span className="text-gray-500 dark:text-gray-400">
            (soft {hand.softTotal}/{hand.total})
          </span>
        )}
        {hand.isBlackjack && (
          <span className="font-bold text-green-600 dark:text-green-400">
            Blackjack!
          </span>
        )}
        {hand.isBust && (
          <span className="font-bold text-red-600 dark:text-red-400">
            Bust!
          </span>
        )}
      </div>
    </div>
  );
}
