import { getTableConfig } from 'drizzle-orm/sqlite-core';

import { taskLog, taskTemplate, userFlags, userState, userTask } from './schema';

function columnNames(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).columns.map((column) => column.name);
}

describe('database schema', () => {
  test('declares the five persisted MVP tables', () => {
    expect(
      [taskTemplate, userTask, taskLog, userState, userFlags].map(
        (table) => getTableConfig(table).name,
      ),
    ).toEqual(['task_template', 'user_task', 'task_log', 'user_state', 'user_flags']);
  });

  test('keeps research attribution nullable and task tags persisted', () => {
    const config = getTableConfig(taskTemplate);
    const sourceDoi = config.columns.find((column) => column.name === 'source_doi');

    expect(sourceDoi?.notNull).toBe(false);
    expect(columnNames(taskTemplate)).toEqual(
      expect.arrayContaining(['source_citation', 'source_note', 'stopfactor_tags']),
    );
  });

  test('stores category values, immutable baselines, and monotonic XP separately', () => {
    expect(columnNames(userState)).toEqual(
      expect.arrayContaining([
        'sleep',
        'energy',
        'movement',
        'food',
        'water',
        'mind',
        'baseline_sleep',
        'baseline_energy',
        'baseline_movement',
        'baseline_food',
        'baseline_water',
        'baseline_mind',
        'level_xp',
      ]),
    );

    expect(getTableConfig(userState).checks.map((check) => check.name)).toEqual(
      expect.arrayContaining(['user_state_values_range', 'user_state_level_xp_non_negative']),
    );
  });

  test('prevents duplicate daily logs for the same task', () => {
    const primaryKeyColumns = getTableConfig(taskLog).primaryKeys.flatMap((key) =>
      key.columns.map((column) => column.name),
    );

    expect(primaryKeyColumns).toEqual(['user_task_id', 'date']);
  });
});
