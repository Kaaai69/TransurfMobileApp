import { coreTaskTemplates } from '../content/tasks';
import type { DatabaseConnection } from './migrate';

const insertTaskTemplateSql = `
  INSERT OR IGNORE INTO task_template (
    id, category, slot, tier, anchor_text, action_text, subtitle,
    source_doi, source_citation, source_note, min_budget_min, stopfactor_tags
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export async function seedCoreTasks(database: DatabaseConnection) {
  await database.execAsync('BEGIN IMMEDIATE;');

  try {
    for (const task of coreTaskTemplates) {
      await database.runAsync(
        insertTaskTemplateSql,
        task.id,
        task.category,
        task.slot,
        task.tier,
        task.anchorText,
        task.actionText,
        task.subtitle,
        task.sourceDoi,
        task.sourceCitation,
        task.sourceNote,
        task.minBudgetMin,
        JSON.stringify(task.stopfactorTags),
      );
    }

    await database.execAsync('COMMIT;');
  } catch (error) {
    await database.execAsync('ROLLBACK;');
    throw error;
  }
}
