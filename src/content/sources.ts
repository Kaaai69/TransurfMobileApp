import { categories, type Category } from '../db/schema';
import { coreTaskTemplates } from './tasks';
import type { CategoryScores } from '../domain/scoring';

export type SourceCategory = Category | 'system';

export type SourceRecord = Readonly<{
  doi: string;
  work: string;
  journal: string;
  year: number;
  category: SourceCategory;
}>;

/**
 * Доказательная база из docs/onboarding-brief.md, часть 1.
 * Ganio 2011 (вода) в карточки источников не попадает — у работы спонсорский
 * след, и бриф прямо рекомендует не выносить воду в карточки.
 */
export const sources: readonly SourceRecord[] = [
  {
    doi: '10.1093/sleep/26.2.117',
    work: 'The Cumulative Cost of Additional Wakefulness',
    journal: 'Sleep',
    year: 2003,
    category: 'sleep',
  },
  {
    doi: '10.1136/bjsports-2020-102955',
    work: 'WHO 2020 guidelines on physical activity and sedentary behaviour',
    journal: 'British Journal of Sports Medicine',
    year: 2020,
    category: 'movement',
  },
  {
    doi: '10.1016/S2215-0366(18)30227-X',
    work: 'Association between physical exercise and mental health in 1.2 million individuals',
    journal: 'The Lancet Psychiatry',
    year: 2018,
    category: 'movement',
  },
  {
    doi: '10.1186/s12916-017-0791-y',
    work: 'A randomised controlled trial of dietary improvement for adults with major depression (the SMILES trial)',
    journal: 'BMC Medicine',
    year: 2017,
    category: 'food',
  },
  {
    doi: '10.1001/jamainternmed.2013.13018',
    work: 'Meditation Programs for Psychological Stress and Well-being: A Systematic Review and Meta-analysis',
    journal: 'JAMA Internal Medicine',
    year: 2014,
    category: 'mind',
  },
  {
    doi: '10.1016/j.xcrm.2022.100895',
    work: 'Brief structured respiration practices enhance mood and reduce physiological arousal',
    journal: 'Cell Reports Medicine',
    year: 2023,
    category: 'mind',
  },
  {
    doi: '10.5664/jcsm.3170',
    work: 'Caffeine Effects on Sleep Taken 0, 3, or 6 Hours before Going to Bed',
    journal: 'Journal of Clinical Sleep Medicine',
    year: 2013,
    category: 'energy',
  },
  {
    doi: '10.1016/j.cub.2013.06.039',
    work: 'Entrainment of the Human Circadian Clock to the Natural Light-Dark Cycle',
    journal: 'Current Biology',
    year: 2013,
    category: 'energy',
  },
  {
    doi: '10.1002/ejsp.674',
    work: 'How are habits formed: Modelling habit formation in the real world',
    journal: 'European Journal of Social Psychology',
    year: 2010,
    category: 'system',
  },
  {
    doi: '10.1016/S0065-2601(06)38002-1',
    work: 'Implementation intentions and goal achievement: A meta-analysis of effects and processes',
    journal: 'Advances in Experimental Social Psychology',
    year: 2006,
    category: 'system',
  },
];

const systemSourceOrder: readonly SourceCategory[] = ['system'];

export function findSourceByDoi(doi: string | null): SourceRecord | null {
  if (doi === null) return null;

  return sources.find((source) => source.doi === doi) ?? null;
}

export function doiUrl(doi: string): string {
  return `https://doi.org/${doi}`;
}

function tierOneDoiByCategory(): Record<Category, string | null> {
  const byCategory = {} as Record<Category, string | null>;

  for (const category of categories) {
    const tierOne = coreTaskTemplates.find(
      (task) => task.category === category && task.tier === 1,
    );

    byCategory[category] = tierOne?.sourceDoi ?? null;
  }

  return byCategory;
}

/** Карточки для экрана 22: 4–6 работ, подобранных под профиль пользователя. */
export function selectSourcesForProfile(
  scores: CategoryScores,
  limit: number = 6,
): readonly SourceRecord[] {
  const tierOneDoi = tierOneDoiByCategory();
  const selected: SourceRecord[] = [];
  const seen = new Set<string>();

  const categoriesByScore = [...categories].sort(
    (left, right) => scores[left] - scores[right],
  );

  for (const category of categoriesByScore) {
    const doi = tierOneDoi[category];
    if (doi === null || seen.has(doi)) continue;

    const source = findSourceByDoi(doi);
    if (source === null) continue;

    selected.push(source);
    seen.add(source.doi);
  }

  for (const group of systemSourceOrder) {
    if (selected.length >= limit) break;

    for (const source of sources.filter((entry) => entry.category === group)) {
      if (selected.length >= limit) break;
      if (seen.has(source.doi)) continue;

      selected.push(source);
      seen.add(source.doi);
    }
  }

  return selected.slice(0, limit);
}
