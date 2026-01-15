import type { Hand, Card, StrategyRecommendation, GameAction } from '@/app/types/game';

// Get dealer upcard value (Ace = 11, face cards = 10)
function getDealerValue(upCard: Card): number {
  if (upCard.rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(upCard.rank)) return 10;
  return parseInt(upCard.rank);
}

// Check if hand is a pair
function isPair(hand: Hand): boolean {
  return hand.cards.length === 2 && hand.cards[0].rank === hand.cards[1].rank;
}

// Get strategy recommendation for a hand
export function getStrategyRecommendation(
  playerHand: Hand,
  dealerUpCard: Card
): StrategyRecommendation {
  const dealerValue = getDealerValue(dealerUpCard);
  const dealerIsLow = dealerValue >= 2 && dealerValue <= 6;
  const dealerIsHigh = dealerValue >= 7 && dealerValue <= 10 || dealerValue === 11;

  // Check for pair first
  if (isPair(playerHand) && playerHand.canSplit) {
    const pairAction = getPairStrategy(playerHand.cards[0].rank, dealerValue);
    return {
      action: pairAction.action,
      reason: pairAction.reason,
      isOptimal: true,
    };
  }

  // Check for soft hand
  if (playerHand.isSoft) {
    const softAction = getSoftStrategy(playerHand.total, dealerValue);
    return {
      action: softAction.action,
      reason: softAction.reason,
      isOptimal: true,
    };
  }

  // Hard total strategy
  const hardAction = getHardStrategy(playerHand.total, dealerValue);
  return {
    action: hardAction.action,
    reason: hardAction.reason,
    isOptimal: true,
  };
}

// Pair splitting strategy
function getPairStrategy(rank: Card['rank'], dealerValue: number): { action: GameAction; reason: string } {
  switch (rank) {
    case 'A':
    case '8':
      return {
        action: 'split',
        reason: `Always split ${rank === 'A' ? 'Aces' : '8s'}. This reduces losses and maximizes winning potential.`,
      };
    case '10':
    case 'J':
    case 'Q':
    case 'K':
      return {
        action: 'stand',
        reason: 'Never split 10-value pairs. A 20 is a strong hand.',
      };
    case '9':
      if (dealerValue === 7 || dealerValue === 10 || dealerValue === 11) {
        return {
          action: 'stand',
          reason: 'Stand with 9s vs dealer 7, 10, or Ace. Your 18 is strong enough.',
        };
      } else {
        return {
          action: 'split',
          reason: 'Split 9s vs dealer 2-6, 8, or 9. Two 9s have better value than one 18.',
        };
      }
    case '7':
      if (dealerValue >= 2 && dealerValue <= 7) {
        return {
          action: 'split',
          reason: 'Split 7s vs dealer 2-7. This improves your chances.',
        };
      } else {
        return {
          action: 'hit',
          reason: 'Hit 7s vs dealer 8-Ace. Your 14 is too weak to split.',
        };
      }
    case '6':
      if (dealerValue >= 2 && dealerValue <= 6) {
        return {
          action: 'split',
          reason: 'Split 6s vs dealer 2-6. This reduces losses.',
        };
      } else {
        return {
          action: 'hit',
          reason: 'Hit 6s vs dealer 7-Ace. Your 12 is too weak to split.',
        };
      }
    case '5':
      // Treat as hard 10, don't split
      if (dealerValue >= 2 && dealerValue <= 9) {
        return {
          action: 'double',
          reason: 'Double 5s vs dealer 2-9 (treat as 10). This maximizes value.',
        };
      } else {
        return {
          action: 'hit',
          reason: 'Hit 5s vs dealer 10 or Ace. Your 10 is not strong enough to double.',
        };
      }
    case '4':
      if (dealerValue === 5 || dealerValue === 6) {
        return {
          action: 'split',
          reason: 'Split 4s vs dealer 5-6. This improves your position.',
        };
      } else {
        return {
          action: 'hit',
          reason: 'Hit 4s vs dealer 2-4, 7-Ace. Your 8 is too weak to split.',
        };
      }
    case '3':
    case '2':
      if (dealerValue >= 2 && dealerValue <= 7) {
        return {
          action: 'split',
          reason: `Split ${rank}s vs dealer 2-7. This improves your chances.`,
        };
      } else {
        return {
          action: 'hit',
          reason: `Hit ${rank}s vs dealer 8-Ace. Your low total is too weak to split.`,
        };
      }
    default:
      return {
        action: 'stand',
        reason: 'Stand with this pair.',
      };
  }
}

// Soft hand strategy (Ace counted as 11)
function getSoftStrategy(softTotal: number, dealerValue: number): { action: GameAction; reason: string } {
  const dealerIsLow = dealerValue >= 2 && dealerValue <= 6;
  const dealerIsMedium = dealerValue === 7 || dealerValue === 8;
  const dealerIsHigh = dealerValue === 9 || dealerValue === 10 || dealerValue === 11;

  switch (softTotal) {
    case 13: // A,2
    case 14: // A,3
      if (dealerValue === 5 || dealerValue === 6) {
        return {
          action: 'double',
          reason: `Double soft ${softTotal} vs dealer ${dealerValue === 5 ? '5' : '6'}. This maximizes value.`,
        };
      } else {
        return {
          action: 'hit',
          reason: `Hit soft ${softTotal}. You need to improve your hand.`,
        };
      }
    case 15: // A,4
    case 16: // A,5
      if (dealerValue >= 4 && dealerValue <= 6) {
        return {
          action: 'double',
          reason: `Double soft ${softTotal} vs dealer 4-6. This maximizes value.`,
        };
      } else {
        return {
          action: 'hit',
          reason: `Hit soft ${softTotal}. You need to improve your hand.`,
        };
      }
    case 17: // A,6
      if (dealerValue >= 3 && dealerValue <= 6) {
        return {
          action: 'double',
          reason: 'Double soft 17 vs dealer 3-6. This maximizes value.',
        };
      } else if (dealerValue === 7 || dealerValue === 8) {
        return {
          action: 'stand',
          reason: 'Stand on soft 17 vs dealer 7-8. Your 17 is adequate.',
        };
      } else {
        return {
          action: 'hit',
          reason: 'Hit soft 17 vs dealer 9-Ace. You need to improve.',
        };
      }
    case 18: // A,7
      if (dealerValue >= 3 && dealerValue <= 6) {
        return {
          action: 'double',
          reason: 'Double soft 18 vs dealer 3-6. This maximizes value.',
        };
      } else if (dealerValue === 2 || dealerValue === 7 || dealerValue === 8) {
        return {
          action: 'stand',
          reason: 'Stand on soft 18 vs dealer 2, 7-8. Your 18 is strong.',
        };
      } else {
        return {
          action: 'hit',
          reason: 'Hit soft 18 vs dealer 9-Ace. You need to improve.',
        };
      }
    case 19: // A,8
    case 20: // A,9
      return {
        action: 'stand',
        reason: `Always stand on soft ${softTotal}. This is a strong hand.`,
      };
    default:
      return {
        action: 'stand',
        reason: 'Stand on this soft hand.',
      };
  }
}

// Hard total strategy
function getHardStrategy(hardTotal: number, dealerValue: number): { action: GameAction; reason: string } {
  const dealerIsLow = dealerValue >= 2 && dealerValue <= 6;
  const dealerIsHigh = dealerValue >= 7 && dealerValue <= 10 || dealerValue === 11;

  if (hardTotal <= 8) {
    return {
      action: 'hit',
      reason: `Always hit ${hardTotal} or less. You need to improve your hand.`,
    };
  }

  if (hardTotal === 9) {
    if (dealerValue >= 3 && dealerValue <= 6) {
      return {
        action: 'double',
        reason: 'Double 9 vs dealer 3-6. This maximizes value.',
      };
    } else {
      return {
        action: 'hit',
        reason: 'Hit 9 vs dealer 2, 7-Ace. You need to improve.',
      };
    }
  }

  if (hardTotal === 10) {
    if (dealerValue >= 2 && dealerValue <= 9) {
      return {
        action: 'double',
        reason: 'Double 10 vs dealer 2-9. This maximizes value.',
      };
    } else {
      return {
        action: 'hit',
        reason: 'Hit 10 vs dealer 10 or Ace. Your 10 is not strong enough to double.',
      };
    }
  }

  if (hardTotal === 11) {
    if (dealerValue >= 2 && dealerValue <= 10) {
      return {
        action: 'double',
        reason: 'Double 11 vs dealer 2-10. This maximizes value.',
      };
    } else {
      return {
        action: 'hit',
        reason: 'Hit 11 vs dealer Ace. Your 11 is not strong enough to double.',
      };
    }
  }

  if (hardTotal === 12) {
    if (dealerValue >= 4 && dealerValue <= 6) {
      return {
        action: 'stand',
        reason: 'Stand on 12 vs dealer 4-6. Dealer is likely to bust.',
      };
    } else {
      return {
        action: 'hit',
        reason: 'Hit 12 vs dealer 2-3, 7-Ace. You need to improve.',
      };
    }
  }

  if (hardTotal >= 13 && hardTotal <= 16) {
    if (dealerIsLow) {
      return {
        action: 'stand',
        reason: `Stand on ${hardTotal} vs dealer 2-6. Dealer is likely to bust.`,
      };
    } else {
      return {
        action: 'hit',
        reason: `Hit ${hardTotal} vs dealer 7-Ace. Dealer is likely to beat you.`,
      };
    }
  }

  if (hardTotal >= 17) {
    return {
      action: 'stand',
      reason: `Always stand on ${hardTotal} or higher. This is a strong hand.`,
    };
  }

  return {
    action: 'stand',
    reason: 'Stand on this hand.',
  };
}

// Check if player's action matches strategy recommendation
export function isActionOptimal(
  playerAction: GameAction,
  recommendation: StrategyRecommendation
): boolean {
  // Map similar actions
  if (playerAction === 'stand' && recommendation.action === 'stand') return true;
  if (playerAction === 'hit' && recommendation.action === 'hit') return true;
  if (playerAction === 'double' && recommendation.action === 'double') return true;
  if (playerAction === 'split' && recommendation.action === 'split') return true;
  if (playerAction === 'surrender' && recommendation.action === 'surrender') return true;

  // Double can sometimes be acceptable as hit (but not optimal)
  if (playerAction === 'hit' && recommendation.action === 'double') return false;
  if (playerAction === 'double' && recommendation.action === 'hit') return false;

  return false;
}
