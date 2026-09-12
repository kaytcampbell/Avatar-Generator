import { useEffect } from 'react';

interface UseKeyboardShortcutsOptions {
  selectedLayerId: string | null;
  onDelete: (layerId: string) => void;
  onUndo: () => void;
  onRedo: () => void;
}

function isTypingTarget(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

/**
 * Delete/Backspace removes the selected prop; Cmd/Ctrl+Z undoes; Cmd/Ctrl+Shift+Z
 * and Ctrl+Y redo (covering both the Mac and Windows conventions). All are
 * suppressed while focus is in a text field.
 */
export function useKeyboardShortcuts({ selectedLayerId, onDelete, onUndo, onRedo }: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(document.activeElement)) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId) {
        e.preventDefault();
        onDelete(selectedLayerId);
        return;
      }

      const isModifierHeld = e.metaKey || e.ctrlKey;
      if (!isModifierHeld) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        onRedo();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, onDelete, onUndo, onRedo]);
}
