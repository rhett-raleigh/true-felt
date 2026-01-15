'use client';

import type { StrategyRecommendation } from '@/app/types/game';

interface StrategyHintProps {
  recommendation: StrategyRecommendation;
  className?: string;
}

const actionLabels: Record<string, string> = {
  hit: 'Hit',
  stand: 'Stand',
  double: 'Double Down',
  split: 'Split',
  surrender: 'Surrender',
};

const actionIcons: Record<string, string> = {
  hit: '⬇️',
  stand: '✋',
  double: '💰',
  split: '✂️',
  surrender: '🏳️',
};

export default function StrategyHint({ recommendation, className = '' }: StrategyHintProps) {
  const actionLabel = actionLabels[recommendation.action] || recommendation.action;
  const actionIcon = actionIcons[recommendation.action] || '💡';

  return (
    <div
      className={`
        p-4 rounded-lg border-2
        bg-blue-50 dark:bg-blue-900/20
        border-blue-300 dark:border-blue-700
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{actionIcon}</div>
        <div className="flex-1">
          <div className="font-bold text-blue-900 dark:text-blue-100 mb-1">
            Basic Strategy Recommendation
          </div>
          <div className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            {actionLabel}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            {recommendation.reason}
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white text-sm">✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
