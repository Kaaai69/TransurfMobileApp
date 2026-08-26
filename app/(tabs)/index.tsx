import AsyncStorage from 'expo-sqlite/kv-store';
import { Redirect, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { ScreenShell } from '../../src/components';
import { databaseReady, sqlite } from '../../src/db/client';
import { readChainState } from '../../src/daily/chain';
import { DailyScreen } from '../../src/daily/DailyScreen';
import {
  loadDailySnapshot,
  markCoreDone,
  markMicroDone,
  markSupportDone,
  type DailySnapshot,
} from '../../src/daily/model';

/**
 * Временная обёртка этапа T19: экран дня без вех.
 * Вехи дней 3/7/11/14 подключаются гейтом следующим коммитом.
 */
export default function DayTab() {
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null);
  const [missingProfile, setMissingProfile] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Error | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    await databaseReady;

    const chain = await readChainState(AsyncStorage);
    const loaded = await loadDailySnapshot(sqlite, chain);

    if (!mounted.current) return;

    if (loaded === null) {
      setMissingProfile(true);
      setReady(true);

      return;
    }

    setSnapshot(loaded);
    setReady(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      mounted.current = true;

      void refresh().catch((error: unknown) => {
        if (mounted.current) setFailure(error instanceof Error ? error : new Error(String(error)));
      });

      return () => {
        mounted.current = false;
      };
    }, [refresh]),
  );

  const runAction = useCallback(
    (action: () => Promise<void>) => {
      if (busy) return;

      setBusy(true);

      void action()
        .then(refresh)
        .catch((error: unknown) => {
          if (mounted.current) {
            setFailure(error instanceof Error ? error : new Error(String(error)));
          }
        })
        .finally(() => {
          if (mounted.current) setBusy(false);
        });
    },
    [busy, refresh],
  );

  if (failure !== null) throw failure;
  if (!ready) return null;
  if (missingProfile || snapshot === null) return <Redirect href="/onboarding/1" />;

  return (
    <ScreenShell level="L1">
      <DailyScreen
        busy={busy}
        snapshot={snapshot}
        onCoreDone={() =>
          runAction(async () => {
            await markCoreDone(sqlite, AsyncStorage);
          })
        }
        onMicroDone={() =>
          runAction(async () => {
            if (snapshot.micro !== null) await markMicroDone(sqlite, snapshot.micro.templateId);
          })
        }
        onSupportDone={(taskId) =>
          runAction(async () => {
            await markSupportDone(sqlite, taskId);
          })
        }
      />
    </ScreenShell>
  );
}
