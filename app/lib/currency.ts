import {
  getBalance,
  updateBalance,
  isDailyBonusAvailable,
  claimDailyBonus,
  getTimeUntilNextBonus,
} from "./storage";

// Currency constants
export const MIN_BET = 10;
export const MAX_BET = 5000;
export const DEFAULT_BALANCE = 10000;
export const DAILY_BONUS_AMOUNT = 1000;

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("$", "");
}

// Format currency with chips label
export function formatChips(amount: number): string {
  return `${formatCurrency(amount)} chips`;
}

// Check if bet is valid
export function isValidBet(bet: number, balance: number): boolean {
  return bet >= MIN_BET && bet <= MAX_BET && bet <= balance;
}

// Get maximum allowed bet
export function getMaxBet(balance: number): number {
  return Math.min(MAX_BET, balance);
}

// Get minimum allowed bet
export function getMinBet(balance: number): number {
  return Math.min(MIN_BET, balance);
}

// Calculate winnings from game result
export function calculateWinnings(
  bet: number,
  result: "win" | "loss" | "push" | "blackjack" | null
): number {
  switch (result) {
    case "blackjack":
      return Math.floor(bet * 1.5); // 3:2 payout
    case "win":
      return bet;
    case "loss":
      return -bet;
    case "push":
      return 0;
    default:
      return 0;
  }
}

// Apply winnings to balance
export function applyWinnings(winnings: number): number {
  return updateBalance(winnings);
}

// Check and claim daily bonus if available
export function checkAndClaimDailyBonus(): {
  claimed: boolean;
  newBalance: number;
} {
  if (isDailyBonusAvailable()) {
    const claimed = claimDailyBonus();
    if (claimed) {
      return { claimed: true, newBalance: getBalance() };
    }
  }
  return { claimed: false, newBalance: getBalance() };
}

// Get formatted time until next bonus
export function getFormattedTimeUntilBonus(): string {
  const ms = getTimeUntilNextBonus();
  if (ms === 0) {
    return "Available now";
  }

  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
