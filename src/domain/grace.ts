export type GraceState = Readonly<{
  chainLength: number;
  usedAt: readonly string[];
  downgradeOffered: boolean;
}>;

export type GraceStatus = Readonly<{
  activeUses: readonly string[];
  graceDaysLeft: number;
}>;

export type GraceTransition = GraceState &
  Readonly<{
    graceDaysLeft: number;
    graceUsed: boolean;
  }>;

const graceAllowance = 2;
const dayMilliseconds = 24 * 60 * 60 * 1000;

function utcDay(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / dayMilliseconds;
}

export function getGraceStatus(state: GraceState, asOf: string): GraceStatus {
  const asOfDay = utcDay(asOf);
  const activeUses = state.usedAt
    .filter((date) => {
      const age = asOfDay - utcDay(date);
      return age >= 0 && age < 30;
    })
    .sort((left, right) => utcDay(left) - utcDay(right));

  return {
    activeUses,
    graceDaysLeft: Math.max(0, graceAllowance - activeUses.length),
  };
}

export function applyMiss(state: GraceState, date: string): GraceTransition {
  const { activeUses, graceDaysLeft } = getGraceStatus(state, date);

  if (graceDaysLeft === 0) {
    return {
      chainLength: state.chainLength,
      usedAt: activeUses,
      downgradeOffered: true,
      graceDaysLeft: 0,
      graceUsed: false,
    };
  }

  const usedAt = [...activeUses, date].sort((left, right) => utcDay(left) - utcDay(right));

  return {
    chainLength: state.chainLength,
    usedAt,
    downgradeOffered: state.downgradeOffered,
    graceDaysLeft: graceAllowance - usedAt.length,
    graceUsed: true,
  };
}
