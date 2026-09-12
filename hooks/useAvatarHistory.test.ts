import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAvatarHistory } from './useAvatarHistory';

describe('useAvatarHistory', () => {
  it('starts with nothing to undo or redo', () => {
    const { result } = renderHook(() => useAvatarHistory<number>());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('undo returns the previously recorded value and enables redo', () => {
    const { result } = renderHook(() => useAvatarHistory<number>());

    act(() => result.current.record(1));
    expect(result.current.canUndo).toBe(true);

    let restored: number | undefined;
    act(() => {
      restored = result.current.undo(2);
    });

    expect(restored).toBe(1);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('redo replays the value undo moved away from', () => {
    const { result } = renderHook(() => useAvatarHistory<number>());

    act(() => result.current.record(1));
    act(() => {
      result.current.undo(2);
    });

    let restored: number | undefined;
    act(() => {
      restored = result.current.redo(1);
    });

    expect(restored).toBe(2);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.canUndo).toBe(true);
  });

  it('recording a new change clears the redo stack', () => {
    const { result } = renderHook(() => useAvatarHistory<number>());

    act(() => result.current.record(1));
    act(() => {
      result.current.undo(2);
    });
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.record(3));

    expect(result.current.canRedo).toBe(false);
  });

  it('drops the oldest entry once the limit is exceeded', () => {
    const { result } = renderHook(() => useAvatarHistory<number>(2));

    act(() => result.current.record(1));
    act(() => result.current.record(2));
    act(() => result.current.record(3));

    // Only the two most recent recordings (2, 3) should remain — the
    // oldest (1) was dropped when the third record() exceeded the limit.
    let first: number | undefined;
    let second: number | undefined;
    let third: number | undefined;
    act(() => {
      first = result.current.undo(4);
    });
    act(() => {
      second = result.current.undo(first as number);
    });
    act(() => {
      third = result.current.undo(second as number);
    });

    expect(first).toBe(3);
    expect(second).toBe(2);
    expect(third).toBeUndefined();
  });

  it('undo/redo are no-ops when their stacks are empty', () => {
    const { result } = renderHook(() => useAvatarHistory<number>());

    let undone: number | undefined;
    let redone: number | undefined;
    act(() => {
      undone = result.current.undo(1);
      redone = result.current.redo(1);
    });

    expect(undone).toBeUndefined();
    expect(redone).toBeUndefined();
  });

  it('reset clears both stacks', () => {
    const { result } = renderHook(() => useAvatarHistory<number>());

    act(() => result.current.record(1));
    act(() => {
      result.current.undo(2);
    });
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.reset());

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });
});
