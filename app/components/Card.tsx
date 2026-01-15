"use client";

import type { Card as CardType } from "@/app/types/game";

interface CardProps {
  card: CardType;
  faceDown?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const suitSymbols: Record<CardType["suit"], string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const suitColors: Record<CardType["suit"], string> = {
  hearts: "text-red-600",
  diamonds: "text-red-600",
  clubs: "text-black",
  spades: "text-black",
};

const sizeClasses = {
  sm: "w-10 h-14 sm:w-12 sm:h-16 text-xs",
  md: "w-14 h-20 sm:w-16 sm:h-24 text-xs sm:text-sm",
  lg: "w-18 h-26 sm:w-20 sm:h-28 text-sm sm:text-base",
};

export default function Card({
  card,
  faceDown = false,
  size = "md",
  className = "",
}: CardProps) {
  if (faceDown) {
    return (
      <div
        className={`
          ${sizeClasses[size]}
          bg-gradient-to-br from-blue-900 to-blue-700
          rounded-lg border-2 border-gray-800
          flex items-center justify-center
          shadow-lg
          ${className}
        `}
      >
        <div className="text-white text-xs font-bold">🂠</div>
      </div>
    );
  }

  const suitSymbol = suitSymbols[card.suit];
  const suitColor = suitColors[card.suit];

  return (
    <div
      className={`
        ${sizeClasses[size]}
        bg-white rounded-lg border-2 border-gray-300
        flex flex-col items-center justify-between p-1
        shadow-md hover:shadow-lg transition-shadow
        ${className}
      `}
    >
      <div className={`${suitColor} font-bold self-start`}>{card.rank}</div>
      <div className={`${suitColor} text-2xl`}>{suitSymbol}</div>
      <div className={`${suitColor} font-bold self-end rotate-180`}>
        {card.rank}
      </div>
    </div>
  );
}
