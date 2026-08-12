export const ringCategoryOrder = ['sleep', 'energy', 'movement', 'food', 'water', 'mind'] as const;

export type RingCategory = (typeof ringCategoryOrder)[number];
export type StateRingValues = Record<RingCategory, number>;
export type HabitDayStatus = 'done' | 'forgiven' | 'pending';

export type RingPoint = Readonly<{ x: number; y: number }>;
export type RingTextAnchor = 'start' | 'middle' | 'end';

export type HabitStatusSummary = Readonly<{
  done: number;
  forgiven: number;
  pending: number;
  total: number;
}>;

export type StateSector = Readonly<{
  category: RingCategory;
  value: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  path: string;
  length: number;
  compactLabelPoint: RingPoint;
  compactLabelAnchor: RingTextAnchor;
  externalLabelPoint: RingPoint;
}>;

export type HabitSegment = Readonly<{
  day: number;
  status: HabitDayStatus;
  radius: number;
  startAngle: number;
  endAngle: number;
  path: string;
  length: number;
  strokeWidth: 2.5 | 6;
}>;

export const ringGeometry = {
  viewBoxSize: 260,
  defaultSize: 260,
  center: 130,
  compactBreakpoint: 320,
  stateStartAngle: -88,
  stateSectorAngle: 56,
  stateSlotAngle: 60,
  habitStartAngle: -90,
  habitSegmentAngle: 6,
  habitRadius: 105,
  stateStrokeWidth: 7,
  compactLabelClearance: 26,
  compactLabelMaxRadius: 112,
  externalLabelRadius: 118,
  habitDayCount: 60,
} as const;

function roundCoordinate(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function pointAt(radius: number, angle: number): RingPoint {
  const radians = (angle * Math.PI) / 180;

  return {
    x: roundCoordinate(ringGeometry.center + radius * Math.cos(radians)),
    y: roundCoordinate(ringGeometry.center + radius * Math.sin(radians)),
  };
}

function arcPath(radius: number, startAngle: number, endAngle: number): string {
  const start = pointAt(radius, startAngle);
  const end = pointAt(radius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function arcLength(radius: number, startAngle: number, endAngle: number): number {
  return (Math.PI * radius * (endAngle - startAngle)) / 180;
}

function inwardTextAnchor(angle: number): RingTextAnchor {
  return Math.cos((angle * Math.PI) / 180) >= 0 ? 'end' : 'start';
}

export function mapStateValueToRadius(value: number): number {
  const clampedValue = Math.max(0, Math.min(100, value));

  return 35 + clampedValue * 0.7;
}

export function buildStateSectors(values: StateRingValues): readonly StateSector[] {
  return ringCategoryOrder.map((category, index) => {
    const value = Math.max(0, Math.min(100, values[category]));
    const radius = mapStateValueToRadius(value);
    const startAngle = ringGeometry.stateStartAngle + index * ringGeometry.stateSlotAngle;
    const endAngle = startAngle + ringGeometry.stateSectorAngle;
    const middleAngle = (startAngle + endAngle) / 2;

    return {
      category,
      value,
      radius,
      startAngle,
      endAngle,
      path: arcPath(radius, startAngle, endAngle),
      length: arcLength(radius, startAngle, endAngle),
      compactLabelPoint: pointAt(
        Math.min(radius + ringGeometry.compactLabelClearance, ringGeometry.compactLabelMaxRadius),
        middleAngle,
      ),
      compactLabelAnchor: inwardTextAnchor(middleAngle),
      externalLabelPoint: pointAt(ringGeometry.externalLabelRadius, middleAngle),
    };
  });
}

export function summarizeHabitStatuses(days: readonly HabitDayStatus[]): HabitStatusSummary {
  const summary = { done: 0, forgiven: 0, pending: 0 };

  for (const status of days.slice(0, ringGeometry.habitDayCount)) {
    summary[status] += 1;
  }

  return { ...summary, total: summary.done + summary.forgiven + summary.pending };
}

export function buildHabitSegments(days: readonly HabitDayStatus[]): readonly HabitSegment[] {
  return days.slice(0, ringGeometry.habitDayCount).map((status, index) => {
    const startAngle = ringGeometry.habitStartAngle + index * ringGeometry.habitSegmentAngle;
    const endAngle = startAngle + ringGeometry.habitSegmentAngle;

    return {
      day: index + 1,
      status,
      radius: ringGeometry.habitRadius,
      startAngle,
      endAngle,
      path: arcPath(ringGeometry.habitRadius, startAngle, endAngle),
      length: arcLength(ringGeometry.habitRadius, startAngle, endAngle),
      strokeWidth: status === 'forgiven' ? 2.5 : 6,
    };
  });
}
