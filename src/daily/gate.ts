import type { KeyValueStorage } from '../launch/state';
import type { ChainState } from './chain';
import type { DateString } from '../domain/dates';

const milestonesStorageKey = 'daily.milestones';
const postponedOfferKey = 'daily.tierOfferPostponedUntil';

export type ShownMilestones = Readonly<{
  day3: boolean;
  day7: boolean;
  day14: boolean;
  missed: Readonly<Record<DateString, true>>;
}>;

export const emptyShownMilestones: ShownMilestones = {
  day3: false,
  day7: false,
  day14: false,
  missed: {},
};

function isDateString(value: unknown): value is DateString {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function sanitizeShownMilestones(value: unknown): ShownMilestones {
  if (typeof value !== 'object' || value === null) return emptyShownMilestones;

  const candidate = value as Record<string, unknown>;
  const missedSource =
    typeof candidate.missed === 'object' && candidate.missed !== null
      ? (candidate.missed as Record<string, unknown>)
      : {};

  const missed: Record<DateString, true> = {};

  for (const [key, entry] of Object.entries(missedSource)) {
    if (isDateString(key) && entry === true) missed[key] = true;
  }

  return {
    day3: candidate.day3 === true,
    day7: candidate.day7 === true,
    day14: candidate.day14 === true,
    missed,
  };
}

export async function readShownMilestones(storage: KeyValueStorage): Promise<ShownMilestones> {
  const stored = await storage.getItem(milestonesStorageKey);

  if (stored === null) return emptyShownMilestones;

  try {
    return sanitizeShownMilestones(JSON.parse(stored));
  } catch {
    return emptyShownMilestones;
  }
}

export async function markMilestoneShown(
  storage: KeyValueStorage,
  update: Readonly<{ day?: 3 | 7 | 14; missedDate?: DateString }>,
): Promise<ShownMilestones> {
  const shown = await readShownMilestones(storage);
  const next = {
    day3: shown.day3 || update.day === 3,
    day7: shown.day7 || update.day === 7,
    day14: shown.day14 || update.day === 14,
    missed:
      update.missedDate === undefined
        ? shown.missed
        : { ...shown.missed, [update.missedDate]: true as const },
  };

  await storage.setItem(milestonesStorageKey, JSON.stringify(next));

  return next;
}

export async function readPostponedOfferUntil(
  storage: KeyValueStorage,
): Promise<DateString | null> {
  const stored = await storage.getItem(postponedOfferKey);

  return isDateString(stored) ? stored : null;
}

export function postponeTierOffer(storage: KeyValueStorage, today: DateString): Promise<void> {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7)) - 1;
  const day = Number(today.slice(8, 10));
  const due = new Date(Date.UTC(year, month, day + 7));

  return storage.setItem(postponedOfferKey, due.toISOString().slice(0, 10));
}

export type GateDecision =
  | Readonly<{ kind: 'none' }>
  | Readonly<{ kind: 'downgrade' }>
  | Readonly<{ kind: 'missed'; date: DateString }>
  | Readonly<{ kind: 'day3' }>
  | Readonly<{ kind: 'recalc' }>
  | Readonly<{ kind: 'summary' }>
  | Readonly<{ kind: 'tierOffer' }>;

export type GateInput = Readonly<{
  chain: ChainState;
  shown: ShownMilestones;
  forgivenDates: readonly DateString[];
  dayNumber: number;
  today: DateString;
  postponedUntil: DateString | null;
}>;

/**
 * Порядок важности: сначала честный разговор о пропусках,
 * затем текстовые вехи, затем пересчёт и итог.
 */
export function selectGateDecision(input: GateInput): GateDecision {
  if (input.chain.downgradeOffered) return { kind: 'downgrade' };

  const unshownMiss = [...input.forgivenDates]
    .filter((date) => input.shown.missed[date] !== true)
    .sort()
    .at(-1);

  if (unshownMiss !== undefined) return { kind: 'missed', date: unshownMiss };

  if (input.dayNumber >= 3 && !input.shown.day3) return { kind: 'day3' };
  if (input.dayNumber >= 7 && !input.shown.day7) return { kind: 'recalc' };

  const offerDue = input.postponedUntil === null || input.postponedUntil <= input.today;

  if (input.dayNumber >= 14 && !input.shown.day14 && offerDue) return { kind: 'summary' };
  if (input.dayNumber >= 14 && offerDue) return { kind: 'tierOffer' };

  return { kind: 'none' };
}
