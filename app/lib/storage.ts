import type { StoredData, GameStats } from "@/app/types/game";

const STORAGE_KEY = "blackjack-app-data";
const DEFAULT_BALANCE = 10000;
const DAILY_BONUS_AMOUNT = 1000;
const DAILY_BONUS_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Default data structure
const defaultData: StoredData = {
  currency: {
    balance: DEFAULT_BALANCE,
    lastDailyBonus: null,
  },
  stats: {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    blackjacks: 0,
    strategyFollowed: 0,
    strategyDeviated: 0,
  },
  settings: {
    hintsEnabled: true,
    soundEnabled: false,
  },
};

// Load data from localStorage
export function loadStoredData(): StoredData {
  if (typeof window === "undefined") {
    return defaultData;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultData;
    }

    const parsed = JSON.parse(stored);
    // Merge with defaults to handle missing fields
    // Ensure null/undefined values are replaced with defaults
    return {
      currency: {
        balance: parsed.currency?.balance ?? defaultData.currency.balance,
        lastDailyBonus:
          parsed.currency?.lastDailyBonus ??
          defaultData.currency.lastDailyBonus,
      },
      stats: {
        gamesPlayed: parsed.stats?.gamesPlayed ?? defaultData.stats.gamesPlayed,
        wins: parsed.stats?.wins ?? defaultData.stats.wins,
        losses: parsed.stats?.losses ?? defaultData.stats.losses,
        pushes: parsed.stats?.pushes ?? defaultData.stats.pushes,
        blackjacks: parsed.stats?.blackjacks ?? defaultData.stats.blackjacks,
        strategyFollowed:
          parsed.stats?.strategyFollowed ?? defaultData.stats.strategyFollowed,
        strategyDeviated:
          parsed.stats?.strategyDeviated ?? defaultData.stats.strategyDeviated,
      },
      settings: {
        hintsEnabled:
          parsed.settings?.hintsEnabled ?? defaultData.settings.hintsEnabled,
        soundEnabled:
          parsed.settings?.soundEnabled ?? defaultData.settings.soundEnabled,
      },
    };
  } catch (error) {
    console.error("Error loading stored data:", error);
    return defaultData;
  }
}

// Save data to localStorage
export function saveStoredData(data: StoredData): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving stored data:", error);
  }
}

// Check if daily bonus is available
export function isDailyBonusAvailable(): boolean {
  const data = loadStoredData();
  const { lastDailyBonus } = data.currency;

  if (lastDailyBonus === null) {
    return true;
  }

  const now = Date.now();
  const timeSinceLastBonus = now - lastDailyBonus;

  return timeSinceLastBonus >= DAILY_BONUS_COOLDOWN;
}

// Get time until next daily bonus (in milliseconds)
export function getTimeUntilNextBonus(): number {
  const data = loadStoredData();
  const { lastDailyBonus } = data.currency;

  if (lastDailyBonus === null) {
    return 0;
  }

  const now = Date.now();
  const timeSinceLastBonus = now - lastDailyBonus;
  const timeUntilNext = DAILY_BONUS_COOLDOWN - timeSinceLastBonus;

  return Math.max(0, timeUntilNext);
}

// Claim daily bonus
export function claimDailyBonus(): boolean {
  if (!isDailyBonusAvailable()) {
    return false;
  }

  const data = loadStoredData();
  data.currency.balance += DAILY_BONUS_AMOUNT;
  data.currency.lastDailyBonus = Date.now();
  saveStoredData(data);

  return true;
}

// Update balance
export function updateBalance(amount: number): number {
  const data = loadStoredData();
  // Ensure balance is never null/undefined - use default if needed
  const currentBalance = data.currency.balance ?? DEFAULT_BALANCE;
  data.currency.balance = Math.max(0, currentBalance + amount);
  saveStoredData(data);
  return data.currency.balance;
}

// Get current balance
export function getBalance(): number {
  const data = loadStoredData();
  // Ensure balance is never null/undefined - use default if needed
  return data.currency.balance ?? DEFAULT_BALANCE;
}

// Update game statistics
export function updateStats(updates: Partial<GameStats>): void {
  const data = loadStoredData();
  data.stats = { ...data.stats, ...updates };
  saveStoredData(data);
}

// Get game statistics
export function getStats(): GameStats {
  const data = loadStoredData();
  return data.stats;
}

// Update settings
export function updateSettings(updates: Partial<StoredData["settings"]>): void {
  const data = loadStoredData();
  data.settings = { ...data.settings, ...updates };
  saveStoredData(data);
}

// Get settings
export function getSettings(): StoredData["settings"] {
  const data = loadStoredData();
  return data.settings;
}
