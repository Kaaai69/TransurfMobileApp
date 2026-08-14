import { sql } from 'drizzle-orm';
import { check, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const categories = ['sleep', 'energy', 'movement', 'food', 'water', 'mind'] as const;
export type Category = (typeof categories)[number];

export const templateSlots = ['core', 'micro'] as const;
export type TemplateSlot = (typeof templateSlots)[number];

export const userTaskSlots = ['core', 'support', 'micro', 'custom'] as const;
export type UserTaskSlot = (typeof userTaskSlots)[number];

export const taskStatuses = ['active', 'graduated', 'dropped'] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export const taskLogStatuses = ['done', 'skipped', 'no_entry'] as const;
export type TaskLogStatus = (typeof taskLogStatuses)[number];

export const stopfactorTypes = ['category', 'system'] as const;
export type StopfactorType = (typeof stopfactorTypes)[number];

export const taskTemplate = sqliteTable(
  'task_template',
  {
    id: text('id').primaryKey(),
    category: text('category', { enum: categories }).notNull(),
    slot: text('slot', { enum: templateSlots }).notNull(),
    tier: integer('tier'),
    anchorText: text('anchor_text').notNull(),
    actionText: text('action_text').notNull(),
    subtitle: text('subtitle').notNull(),
    sourceDoi: text('source_doi'),
    sourceCitation: text('source_citation'),
    sourceNote: text('source_note'),
    minBudgetMin: integer('min_budget_min').notNull(),
    stopfactorTags: text('stopfactor_tags', { mode: 'json' }).$type<string[]>().notNull(),
  },
  (table) => [
    check('task_template_tier_range', sql`${table.tier} IS NULL OR ${table.tier} BETWEEN 1 AND 5`),
    check(
      'task_template_slot_tier_match',
      sql`(${table.slot} = 'core' AND ${table.tier} IS NOT NULL) OR (${table.slot} = 'micro' AND ${table.tier} IS NULL)`,
    ),
    check('task_template_min_budget', sql`${table.minBudgetMin} IN (5, 15, 30)`),
  ],
);

export const userTask = sqliteTable(
  'user_task',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    templateId: text('template_id').references(() => taskTemplate.id),
    slot: text('slot', { enum: userTaskSlots }).notNull(),
    customAnchor: text('custom_anchor'),
    customAction: text('custom_action'),
    category: text('category', { enum: categories }).notNull(),
    startedAt: text('started_at').notNull(),
    status: text('status', { enum: taskStatuses }).notNull(),
  },
  (table) => [
    check(
      'user_task_template_or_custom',
      sql`(${table.slot} = 'custom' AND ${table.templateId} IS NULL AND ${table.customAnchor} IS NOT NULL AND ${table.customAction} IS NOT NULL) OR (${table.slot} <> 'custom' AND ${table.templateId} IS NOT NULL)`,
    ),
  ],
);

export const taskLog = sqliteTable(
  'task_log',
  {
    userTaskId: text('user_task_id')
      .notNull()
      .references(() => userTask.id),
    date: text('date').notNull(),
    status: text('status', { enum: taskLogStatuses }).notNull(),
    xpAwarded: integer('xp_awarded').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userTaskId, table.date] }),
    check('task_log_xp_non_negative', sql`${table.xpAwarded} >= 0`),
  ],
);

export const userState = sqliteTable(
  'user_state',
  {
    userId: text('user_id').primaryKey(),
    sleep: integer('sleep').notNull(),
    energy: integer('energy').notNull(),
    movement: integer('movement').notNull(),
    food: integer('food').notNull(),
    water: integer('water').notNull(),
    mind: integer('mind').notNull(),
    baselineSleep: integer('baseline_sleep').notNull(),
    baselineEnergy: integer('baseline_energy').notNull(),
    baselineMovement: integer('baseline_movement').notNull(),
    baselineFood: integer('baseline_food').notNull(),
    baselineWater: integer('baseline_water').notNull(),
    baselineMind: integer('baseline_mind').notNull(),
    recalculatedAt: text('recalculated_at').notNull(),
    levelXp: integer('level_xp').notNull(),
    graceDaysLeft: integer('grace_days_left').notNull(),
    graceWindowStart: text('grace_window_start').notNull(),
  },
  (table) => [
    check(
      'user_state_values_range',
      sql`${table.sleep} BETWEEN 0 AND 100 AND ${table.energy} BETWEEN 0 AND 100 AND ${table.movement} BETWEEN 0 AND 100 AND ${table.food} BETWEEN 0 AND 100 AND ${table.water} BETWEEN 0 AND 100 AND ${table.mind} BETWEEN 0 AND 100 AND ${table.baselineSleep} BETWEEN 0 AND 100 AND ${table.baselineEnergy} BETWEEN 0 AND 100 AND ${table.baselineMovement} BETWEEN 0 AND 100 AND ${table.baselineFood} BETWEEN 0 AND 100 AND ${table.baselineWater} BETWEEN 0 AND 100 AND ${table.baselineMind} BETWEEN 0 AND 100`,
    ),
    check('user_state_level_xp_non_negative', sql`${table.levelXp} >= 0`),
    check('user_state_grace_days_range', sql`${table.graceDaysLeft} BETWEEN 0 AND 2`),
  ],
);

export const userFlags = sqliteTable(
  'user_flags',
  {
    userId: text('user_id').primaryKey(),
    foodSoftMode: integer('food_soft_mode', { mode: 'boolean' }).notNull(),
    budgetMinutes: integer('budget_minutes').notNull(),
    stopfactorType: text('stopfactor_type', { enum: stopfactorTypes }),
    stopfactorValue: text('stopfactor_value'),
  },
  (table) => [
    check('user_flags_budget_minutes', sql`${table.budgetMinutes} > 0`),
    check(
      'user_flags_stopfactor_pair',
      sql`(${table.stopfactorType} IS NULL AND ${table.stopfactorValue} IS NULL) OR (${table.stopfactorType} IS NOT NULL AND ${table.stopfactorValue} IS NOT NULL)`,
    ),
  ],
);

export const schema = {
  taskTemplate,
  userTask,
  taskLog,
  userState,
  userFlags,
};
