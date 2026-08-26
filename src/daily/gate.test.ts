import { selectGateDecision, type GateInput, type ShownMilestones } from './gate';
import { sanitizeChainState } from './chain';

const shown: ShownMilestones = {
  day3: false,
  day7: false,
  day14: false,
  missed: {},
};

function baseInput(overrides: Partial<GateInput>): GateInput {
  return {
    chain: sanitizeChainState(undefined),
    shown,
    forgivenDates: [],
    dayNumber: 1,
    today: '2026-09-01',
    postponedUntil: null,
    ...overrides,
  };
}

describe('selectGateDecision', () => {
  test('downgrade offer has the highest priority', () => {
    const decision = selectGateDecision(
      baseInput({
        chain: sanitizeChainState({ usedAt: [], processedMisses: [], downgradeOffered: true }),
        dayNumber: 30,
      }),
    );

    expect(decision).toEqual({ kind: 'downgrade' });
  });

  test('an unshown forgiven miss wins over day milestones', () => {
    const decision = selectGateDecision(baseInput({ forgivenDates: ['2026-08-31'], dayNumber: 8 }));

    expect(decision).toEqual({ kind: 'missed', date: '2026-08-31' });
  });

  test('day milestones appear in order and only once', () => {
    expect(selectGateDecision(baseInput({ dayNumber: 2 }))).toEqual({ kind: 'none' });
    expect(selectGateDecision(baseInput({ dayNumber: 3 }))).toEqual({ kind: 'day3' });
    expect(
      selectGateDecision(baseInput({ dayNumber: 7, shown: { ...shown, day3: true } })),
    ).toEqual({ kind: 'recalc' });
    expect(
      selectGateDecision(baseInput({ dayNumber: 14, shown: { ...shown, day3: true, day7: true } })),
    ).toEqual({ kind: 'summary' });
  });

  test('a postponed tier offer returns after seven days', () => {
    const input = baseInput({
      dayNumber: 16,
      shown: { ...shown, day3: true, day7: true, day14: true },
      postponedUntil: '2026-09-01',
    });

    expect(selectGateDecision(input)).toEqual({ kind: 'tierOffer' });
    expect(selectGateDecision({ ...input, postponedUntil: '2026-09-02' })).toEqual({
      kind: 'none',
    });
  });
});
