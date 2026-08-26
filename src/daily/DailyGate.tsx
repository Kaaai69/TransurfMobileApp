import AsyncStorage from 'expo-sqlite/kv-store';
import { Redirect, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { findCoreTaskTemplateById } from '../content/tasks';
import { databaseReady, sqlite } from '../db/client';
import { replaceActiveCoreTask, setGraceDaysLeft, stepDownCoreTask } from '../db/repo';
import { today } from '../domain/dates';
import type { CategoryScores } from '../domain/scoring';
import { rebuildOnAppOpen } from '../notifications/schedule';
import { DailyScreen } from './DailyScreen';
import {
  processMissedDays,
  readChainState,
  resolveGraceDaysLeft,
  saveChainState,
  sanitizeChainState,
  type ChainState,
} from './chain';
import {
  markMilestoneShown,
  postponeTierOffer,
  readPostponedOfferUntil,
  readShownMilestones,
  selectGateDecision,
  type ShownMilestones,
} from './gate';
import {
  Day3Screen,
  DowngradeScreen,
  MissedDayScreen,
  RecalcScreen,
  SummaryScreen,
  type RecalcRow,
} from './MilestoneScreens';
import {
  listCoreMissedDates,
  loadDailySnapshot,
  markCoreDone,
  markMicroDone,
  markSupportDone,
  type DailySnapshot,
} from './model';

export function DailyGate() {
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null);
  const [missingProfile, setMissingProfile] = useState(false);
  const [chain, setChain] = useState<ChainState>(sanitizeChainState(undefined));
  const [shown, setShown] = useState<ShownMilestones>({
    day3: false,
    day7: false,
    day14: false,
    missed: {},
  });
  const [postponedUntil, setPostponedUntil] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    await databaseReady;

    const loadedChain = await readChainState(AsyncStorage);
    const missedDates = await listCoreMissedDates(sqlite);
    const processed = processMissedDays(loadedChain, missedDates);

    if (processed.chain !== loadedChain) {
      await saveChainState(AsyncStorage, processed.chain);
      await setGraceDaysLeft(sqlite, resolveGraceDaysLeft(processed.chain, today()));
    }

    const loadedSnapshot = await loadDailySnapshot(sqlite, processed.chain);

    if (!mountedRef.current) return;

    if (loadedSnapshot === null) {
      setMissingProfile(true);
      setReady(true);
      return;
    }

    const [loadedShown, postponed] = await Promise.all([
      readShownMilestones(AsyncStorage),
      readPostponedOfferUntil(AsyncStorage),
    ]);

    if (!mountedRef.current) return;

    setChain(processed.chain);
    setShown(loadedShown);
    setPostponedUntil(postponed);
    setSnapshot(loadedSnapshot);
    setReady(true);

    // Пуши никогда не должны ломать открытие приложения.
    await rebuildOnAppOpen(loadedSnapshot.core.doneToday).catch(() => {});
  }, []);

  const runAction = useCallback(
    async (action: () => Promise<void>) => {
      if (busy) return;

      setBusy(true);

      try {
        await action();
        await refresh();
      } catch (error: unknown) {
        if (mountedRef.current) {
          setFailure(error instanceof Error ? error : new Error(String(error)));
        }
      } finally {
        if (mountedRef.current) setBusy(false);
      }
    },
    [busy, refresh],
  );

  useFocusEffect(
    useCallback(() => {
      mountedRef.current = true;

      void refresh().catch((error: unknown) => {
        if (mountedRef.current) {
          setFailure(error instanceof Error ? error : new Error(String(error)));
        }
      });

      return () => {
        mountedRef.current = false;
      };
    }, [refresh]),
  );

  if (failure !== null) throw failure;

  if (!ready) return null;
  if (missingProfile || snapshot === null) return <Redirect href="/onboarding/1" />;

  const forgivenInWindow = chain.usedAt.filter(
    (date) => date >= snapshot.core.task.startedAt && date < snapshot.today,
  );
  const decision = selectGateDecision({
    chain,
    shown,
    forgivenDates: forgivenInWindow,
    dayNumber: snapshot.dayNumber,
    today: snapshot.today,
    postponedUntil,
  });

  switch (decision.kind) {
    case 'downgrade':
      return (
        <DowngradeScreen
          onKeep={() =>
            void runAction(async () => {
              await saveChainState(AsyncStorage, { ...chain, downgradeOffered: false });
            })
          }
          onStepDown={() =>
            void runAction(async () => {
              const current = snapshot.core.task;
              const tier = current.tier ?? 1;
              const lowerId = tier > 1 ? `${current.category}-${tier - 1}` : current.templateId;

              if (lowerId !== current.templateId) {
                await stepDownCoreTask(sqlite, current.templateId, lowerId, snapshot.today);
              }

              await saveChainState(AsyncStorage, { ...chain, downgradeOffered: false });
            })
          }
        />
      );

    case 'missed':
      return (
        <MissedDayScreen
          graceDaysLeft={snapshot.graceDaysLeft}
          onContinue={() =>
            void runAction(async () => {
              setShown(await markMilestoneShown(AsyncStorage, { missedDate: decision.date }));
            })
          }
        />
      );

    case 'day3':
      return (
        <Day3Screen
          onContinue={() =>
            void runAction(async () => {
              setShown(await markMilestoneShown(AsyncStorage, { day: 3 }));
            })
          }
        />
      );

    case 'recalc':
      return (
        <RecalcScreen
          graceDaysLeft={snapshot.graceDaysLeft}
          graceUsed={forgivenInWindow.length > 0}
          levelXp={snapshot.levelXp}
          onContinue={() =>
            void runAction(async () => {
              setShown(await markMilestoneShown(AsyncStorage, { day: 7 }));
            })
          }
          rows={buildRows(snapshot.baseline, snapshot.state)}
        />
      );

    case 'summary':
    case 'tierOffer': {
      const tier = snapshot.core.task.tier ?? 5;
      const nextTemplate =
        tier < 5 ? findCoreTaskTemplateById(`${snapshot.core.task.category}-${tier + 1}`) : null;

      return (
        <SummaryScreen
          changedRows={buildChangedRows(snapshot.baseline, snapshot.state)}
          doneCount={snapshot.core.doneCount}
          dayNumber={snapshot.dayNumber}
          forgivenCount={forgivenInWindow.length}
          nextActionText={nextTemplate === null ? null : nextTemplate.actionText}
          onAcceptNextTier={
            nextTemplate === null
              ? () =>
                  void runAction(async () => {
                    setShown(await markMilestoneShown(AsyncStorage, { day: 14 }));
                  })
              : () =>
                  void runAction(async () => {
                    await replaceActiveCoreTask(
                      sqlite,
                      snapshot.core.task.templateId,
                      nextTemplate.id,
                      snapshot.today,
                    );
                    setShown(await markMilestoneShown(AsyncStorage, { day: 14 }));
                  })
          }
          onPostpone={() =>
            void runAction(async () => {
              await postponeTierOffer(AsyncStorage, snapshot.today);
              setShown(await markMilestoneShown(AsyncStorage, { day: 14 }));
            })
          }
        />
      );
    }

    default:
      return (
        <DailyScreen
          busy={busy}
          snapshot={snapshot}
          onCoreDone={() =>
            void runAction(async () => {
              await markCoreDone(sqlite, AsyncStorage);
            })
          }
          onMicroDone={() =>
            void runAction(async () => {
              const templateId = snapshot.micro?.templateId ?? '';

              if (templateId !== '') await markMicroDone(sqlite, templateId);
            })
          }
          onSupportDone={(taskId) =>
            void runAction(async () => {
              await markSupportDone(sqlite, taskId);
            })
          }
        />
      );
  }
}

function buildRows(baseline: CategoryScores, state: CategoryScores): readonly RecalcRow[] {
  return (Object.keys(baseline) as (keyof CategoryScores)[]).map((category) => ({
    category,
    before: Math.round(baseline[category]),
    after: Math.round(state[category]),
  }));
}

function buildChangedRows(baseline: CategoryScores, state: CategoryScores): readonly RecalcRow[] {
  return buildRows(baseline, state).filter(({ before, after }) => before !== after);
}
