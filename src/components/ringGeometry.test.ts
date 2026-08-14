import {
  buildHabitSegments,
  buildStateSectors,
  mapStateValueToRadius,
  ringCategoryOrder,
  ringGeometry,
  summarizeHabitStatuses,
} from './ringGeometry';

describe('ring geometry', () => {
  test('maps the state boundary values to the approved radial range', () => {
    expect(mapStateValueToRadius(-10)).toBe(35);
    expect(mapStateValueToRadius(0)).toBe(35);
    expect(mapStateValueToRadius(50)).toBe(70);
    expect(mapStateValueToRadius(100)).toBe(105);
    expect(mapStateValueToRadius(140)).toBe(105);
  });

  test('keeps the fixed clockwise category order and four-degree gaps', () => {
    const sectors = buildStateSectors({
      sleep: 10,
      energy: 20,
      movement: 30,
      food: 40,
      water: 50,
      mind: 60,
    });
    expect(ringCategoryOrder).toEqual(['sleep', 'energy', 'movement', 'food', 'water', 'mind']);
    expect(sectors.map(({ startAngle, endAngle }) => [startAngle, endAngle])).toEqual([
      [-88, -32],
      [-28, 28],
      [32, 88],
      [92, 148],
      [152, 208],
      [212, 268],
    ]);
  });

  test('keeps forgiven habit days on-path and only changes their width', () => {
    const [done, forgiven] = buildHabitSegments(['done', 'forgiven']);
    expect(done.path).not.toBe(forgiven.path);
    expect(done.strokeWidth).toBe(6);
    expect(forgiven.strokeWidth).toBe(2.5);
    expect(forgiven.startAngle - done.endAngle).toBe(0);
  });

  test('keeps compact labels continuously outside their arcs around the midpoint', () => {
    const labelRadii = [49.9, 50, 50.1].map((value) => {
      const [sector] = buildStateSectors({
        sleep: value,
        energy: value,
        movement: value,
        food: value,
        water: value,
        mind: value,
      });

      return Math.hypot(sector.compactLabelPoint.x - 130, sector.compactLabelPoint.y - 130);
    });

    expect(labelRadii).toEqual([
      expect.closeTo(88, 4),
      expect.closeTo(88, 4),
      expect.closeTo(88, 4),
    ]);
  });

  test('keeps every compact label bbox clear of its arc and the viewBox edge', () => {
    const glyphRadialHalfExtent = ringGeometry.compactLabelGlyphRadialHalfExtent;
    const radialPadding = ringGeometry.compactLabelRadialPadding;

    for (const value of [0, 49.9, 50, 50.1, 100]) {
      const sectors = buildStateSectors({
        sleep: value,
        energy: value,
        movement: value,
        food: value,
        water: value,
        mind: value,
      });

      for (const sector of sectors) {
        const labelRadius = Math.hypot(
          sector.compactLabelPoint.x - ringGeometry.center,
          sector.compactLabelPoint.y - ringGeometry.center,
        );
        const innerLabelEdge = labelRadius - glyphRadialHalfExtent;
        const outerLabelEdge = labelRadius + glyphRadialHalfExtent;
        const availableTangentialArc =
          (Math.PI * labelRadius * (sector.endAngle - sector.startAngle)) / 180;

        expect(innerLabelEdge).toBeGreaterThanOrEqual(
          sector.radius + ringGeometry.stateStrokeWidth / 2 + radialPadding - 0.000_001,
        );
        expect(outerLabelEdge).toBeLessThanOrEqual(ringGeometry.center);
        expect(availableTangentialArc).toBeGreaterThanOrEqual(
          ringGeometry.compactLabelMaxTextWidth + ringGeometry.compactLabelTangentialPadding * 2,
        );
        expect(sector.compactLabelRotation).toBeGreaterThanOrEqual(-90);
        expect(sector.compactLabelRotation).toBeLessThanOrEqual(90);
      }
    }
  });

  test('summarizes forgiven habit days separately from completed days', () => {
    expect(summarizeHabitStatuses(['done', 'forgiven', 'pending', 'forgiven'])).toEqual({
      done: 1,
      forgiven: 2,
      pending: 1,
      total: 4,
    });
  });
});
