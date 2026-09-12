import { useCallback, useState } from 'react';

/**
 * Generic undo/redo stack — deliberately unaware of AvatarProject so it's
 * independently testable and reusable. `record` takes the state *before* a
 * change so `undo` has something to restore to.
 */
export function useAvatarHistory<T>(limit = 50) {
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const record = useCallback(
    (current: T) => {
      setPast((p) => [...p, current].slice(-limit));
      setFuture([]);
    },
    [limit],
  );

  const undo = useCallback(
    (current: T): T | undefined => {
      if (past.length === 0) return undefined;
      const previous = past[past.length - 1];
      setPast(past.slice(0, -1));
      setFuture([current, ...future]);
      return previous;
    },
    [past, future],
  );

  const redo = useCallback(
    (current: T): T | undefined => {
      if (future.length === 0) return undefined;
      const next = future[0];
      setFuture(future.slice(1));
      setPast([...past, current]);
      return next;
    },
    [past, future],
  );

  const reset = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return { record, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0, reset };
}
