import { categories, type Category } from '../db/schema';
import { colors } from './colors';

/** Цвет категории — всегда вместе с иконкой и подписью (DESIGN.md §0.8). */
export const categoryColor = {
  sleep: colors.catSleep,
  energy: colors.catEnergy,
  movement: colors.catMovement,
  food: colors.catFood,
  water: colors.catWater,
  mind: colors.catMind,
} as const satisfies Record<Category, string>;

export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (categories as readonly string[]).includes(value);
}
