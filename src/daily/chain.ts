import type { KeyValueStorage } from '../launch/state';
import { applyMiss, getGraceStatus, type GraceState } from '../domain/grace';
import type { DateString } from '../domain/dates';

const chainStorageKey = 'daily.chain';

export type ChainState = Readonly<{
  usedAt: readonly DateString[];
  processedMisses: readonly DateString[];
  downgradeOffered: boolean;
}>;

export const emptyChainState: ChainState = {
  usedAt: [],
  processedMisses: [],
  downgradeOffered: false,
};

function isDateString(value: unknown): value is DateString {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function sanitizeChainState(value: unknown): ChainState {
  if (typeof value !== 'object' || value === null) return emptyChainState;

  const candidate = value as Record<string, unknown>;

  return {
    usedAt: Array.isArray(candidate.usedAt) ? candidate.usedAt.filter(isDateString) : [],
    processedMisses: Array.isArray(candidate.processedMisses)
      ? candidate.processedMisses.filter(isDateString)
      : [],
    downgradeOffered: candidate.downgradeOffered === true,
  };
}

export async function readChainState(storage: KeyValueStorage): Promise<ChainState> {
  const stored = await storage.getItem(chainStorageKey);

  if (stored === null) return emptyChainState;

  try {
    return sanitizeChainState(JSON.parse(stored));
  } catch {
    return emptyChainState;
  }
}

export function saveChainState(storage: KeyValueStorage, state: ChainState): Promise<void> {
  return storage.setItem(chainStorageKey, JSON.stringify(state));
}

export type MissProcessingResult = Readonly<{
  chain: ChainState;
  newlyForgiven: readonly DateString[];
}>;

/**
 * Пропущенные дни списывают прощённые дни автоматически и по одному.
 * Когда прощённые дни кончились — цепочка всё равно не сбрасывается,
 * меняется только формулировка (downgradeOffered).
 */
export function processMissedDays(
  chain: ChainState,
  missedDates: readonly DateString[],
): MissProcessingResult {
  const unprocessed = missedDates.filter((date) => !chain.processedMisses.includes(date));

  if (unprocessed.length === 0) {
    return { chain, newlyForgiven: [] };
  }

  let currentGrace: GraceState = {
    chainLength: 1,
    usedAt: [...chain.usedAt],
    downgradeOffered: chain.downgradeOffered,
  };
  const newlyForgiven: DateString[] = [];

  for (const date of unprocessed) {
    const transition = applyMiss(currentGrace, date);

    if (transition.graceUsed) {
      newlyForgiven.push(date);
    }

    if (!transition.graceUsed && transition.downgradeOffered) {
      currentGrace = {
        chainLength: currentGrace.chainLength,
        usedAt: transition.usedAt,
        downgradeOffered: true,
      };
      continue;
    }

    currentGrace = {
      chainLength: currentGrace.chainLength,
      usedAt: transition.usedAt,
      downgradeOffered: transition.downgradeOffered,
    };
  }

  return {
    chain: {
      usedAt: currentGrace.usedAt,
      processedMisses: [...chain.processedMisses, ...unprocessed].sort(),
      downgradeOffered: currentGrace.downgradeOffered,
    },
    newlyForgiven,
  };
}

export function resolveGraceDaysLeft(chain: ChainState, asOf: DateString): number {
  return getGraceStatus(
    { chainLength: 1, usedAt: [...chain.usedAt], downgradeOffered: false },
    asOf,
  ).graceDaysLeft;
}
