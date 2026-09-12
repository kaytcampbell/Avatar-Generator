import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

function pressKey(key: string, modifiers: Partial<KeyboardEventInit> = {}) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...modifiers }));
}

function renderShortcuts(overrides: Partial<Parameters<typeof useKeyboardShortcuts>[0]> = {}) {
  const onDelete = vi.fn();
  const onUndo = vi.fn();
  const onRedo = vi.fn();
  renderHook(() => useKeyboardShortcuts({ selectedLayerId: 'layer-1', onDelete, onUndo, onRedo, ...overrides }));
  return { onDelete, onUndo, onRedo };
}

describe('useKeyboardShortcuts', () => {
  it('deletes the selected layer on Delete', () => {
    const { onDelete } = renderShortcuts();

    pressKey('Delete');

    expect(onDelete).toHaveBeenCalledWith('layer-1');
  });

  it('deletes the selected layer on Backspace', () => {
    const { onDelete } = renderShortcuts();

    pressKey('Backspace');

    expect(onDelete).toHaveBeenCalledWith('layer-1');
  });

  it('does nothing when no layer is selected', () => {
    const { onDelete } = renderShortcuts({ selectedLayerId: null });

    pressKey('Delete');

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('does not delete while focus is inside a text input', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const { onDelete } = renderShortcuts();

    pressKey('Backspace');

    expect(onDelete).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('ignores unrelated keys', () => {
    const { onDelete, onUndo, onRedo } = renderShortcuts();

    pressKey('Enter');

    expect(onDelete).not.toHaveBeenCalled();
    expect(onUndo).not.toHaveBeenCalled();
    expect(onRedo).not.toHaveBeenCalled();
  });

  it('undoes on Cmd/Ctrl+Z', () => {
    const { onUndo } = renderShortcuts();

    pressKey('z', { metaKey: true });

    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('redoes on Cmd/Ctrl+Shift+Z', () => {
    const { onRedo, onUndo } = renderShortcuts();

    pressKey('z', { metaKey: true, shiftKey: true });

    expect(onRedo).toHaveBeenCalledTimes(1);
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('redoes on Ctrl+Y', () => {
    const { onRedo } = renderShortcuts();

    pressKey('y', { ctrlKey: true });

    expect(onRedo).toHaveBeenCalledTimes(1);
  });

  it('does not undo/redo while focus is inside a text input', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const { onUndo, onRedo } = renderShortcuts();

    pressKey('z', { metaKey: true });
    pressKey('z', { metaKey: true, shiftKey: true });

    expect(onUndo).not.toHaveBeenCalled();
    expect(onRedo).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('does not undo without a modifier key', () => {
    const { onUndo } = renderShortcuts();

    pressKey('z');

    expect(onUndo).not.toHaveBeenCalled();
  });
});
