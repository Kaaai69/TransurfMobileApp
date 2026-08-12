import { colors, motion, spacing, typography } from './index';

describe('theme contract', () => {
  test('exposes the approved palette without a red token', () => {
    expect(colors).toEqual({
      canvas: '#000000',
      surface1: '#0E0F14',
      surface2: '#161822',
      surface3: '#1F2230',
      border: '#2A2E3C',
      accent: '#4361FF',
      accentBright: '#7C8FFF',
      accentDeep: '#2A3AA8',
      accentDim: '#141B3D',
      onAccent: '#F0F2FF',
      textPrimary: '#F2F1EF',
      textSecondary: '#9096A8',
      textMuted: '#656B7C',
      warm: '#FFB86B',
      warmDim: '#3A2617',
      neutralDown: '#7C8296',
      catSleep: '#8B7BFF',
      catEnergy: '#FFB020',
      catMovement: '#3DDC97',
      catFood: '#F4704E',
      catWater: '#22D3EE',
      catMind: '#DE7BD4',
    });
  });

  test('allows only Inter 400 and 500', () => {
    expect(typography.fonts).toEqual({
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
    });
    expect(typography.weights).toEqual({ regular: 400, medium: 500 });
  });

  test('preserves the layout and motion contracts consumed by components', () => {
    expect(spacing.screen).toBe(20);
    expect(spacing.heights.minTouch).toBe(44);
    expect(motion.ring).toEqual({ duration: 900, stagger: 80, easing: 'ease-out' });
    expect(motion.screen).toEqual({
      duration: 240,
      offsetY: 12,
      easing: [0.16, 1, 0.3, 1],
    });
  });
});
