import { useCallback, useEffect, useReducer, useState } from 'react';
import { getProjectStore } from '@/lib/storage';
import { ensureAvatarLayer } from '@/lib/avatar-layers';
import { ensureExpressionState } from '@/lib/expression-state';
import { loadImageSize } from '@/lib/load-image-size';
import { useAvatarHistory } from './useAvatarHistory';
import type { PlaceableAsset } from '@/types/asset';
import type { AnimationKind, AvatarLayer, AvatarProject } from '@/types/avatar-project';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface EditorState {
  project: AvatarProject | null;
  selectedLayerId: string | null;
  status: LoadStatus;
  loadError: string | null;
  saveStatus: SaveStatus;
  saveError: string | null;
}

export type EditorAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; project: AvatarProject }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'ADD_LAYER'; layer: AvatarLayer }
  | { type: 'SELECT_LAYER'; layerId: string | null }
  | { type: 'MOVE_LAYER'; layerId: string; x: number; y: number }
  | { type: 'UPDATE_LAYER'; layerId: string; patch: Partial<Pick<AvatarLayer, 'x' | 'y' | 'scaleX' | 'scaleY' | 'rotation'>> }
  | { type: 'DELETE_LAYER'; layerId: string }
  | { type: 'DUPLICATE_LAYER'; sourceLayerId: string; newLayer: AvatarLayer }
  | { type: 'REORDER_LAYER'; layerId: string; direction: 'forward' | 'backward' }
  | { type: 'SET_ANIMATION'; kind: AnimationKind }
  | { type: 'SET_ANIMATION_SPEED'; speed: number }
  | { type: 'SET_BACKGROUND'; layer: AvatarLayer | null }
  | { type: 'SET_EXPRESSION'; expressionId: string | null }
  | { type: 'ADD_EXPRESSION_VARIANT'; expressionId: string; url: string }
  | { type: 'RESTORE_PROJECT'; project: AvatarProject }
  | { type: 'RENAME_PROJECT'; name: string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; updatedAt: string }
  | { type: 'SAVE_ERROR'; error: string };

const initialState: EditorState = {
  project: null,
  selectedLayerId: null,
  status: 'idle',
  loadError: null,
  saveStatus: 'idle',
  saveError: null,
};

export function avatarProjectReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', loadError: null };
    case 'LOAD_SUCCESS':
      return { ...state, status: 'ready', project: action.project, loadError: null };
    case 'LOAD_ERROR':
      return { ...state, status: 'error', loadError: action.error };
    case 'ADD_LAYER': {
      if (!state.project) return state;
      return {
        ...state,
        project: { ...state.project, layers: [...state.project.layers, action.layer] },
        selectedLayerId: action.layer.id,
      };
    }
    case 'SELECT_LAYER':
      return { ...state, selectedLayerId: action.layerId };
    case 'MOVE_LAYER': {
      if (!state.project) return state;
      return {
        ...state,
        project: {
          ...state.project,
          layers: state.project.layers.map((layer) =>
            layer.id === action.layerId ? { ...layer, x: action.x, y: action.y } : layer,
          ),
        },
      };
    }
    case 'UPDATE_LAYER': {
      if (!state.project) return state;
      return {
        ...state,
        project: {
          ...state.project,
          layers: state.project.layers.map((layer) =>
            layer.id === action.layerId ? { ...layer, ...action.patch } : layer,
          ),
        },
      };
    }
    case 'DELETE_LAYER': {
      if (!state.project) return state;
      return {
        ...state,
        project: {
          ...state.project,
          layers: state.project.layers.filter((layer) => layer.id !== action.layerId),
        },
        selectedLayerId: state.selectedLayerId === action.layerId ? null : state.selectedLayerId,
      };
    }
    case 'DUPLICATE_LAYER': {
      if (!state.project) return state;
      return {
        ...state,
        project: { ...state.project, layers: [...state.project.layers, action.newLayer] },
        selectedLayerId: action.newLayer.id,
      };
    }
    case 'REORDER_LAYER': {
      if (!state.project) return state;
      // Avatar and props share one z-order so either can be moved in front
      // of or behind the other — a background (at most one, not stacked
      // with them) must never be picked as a swap neighbor.
      const reorderable = [...state.project.layers.filter((layer) => layer.type !== 'background')].sort(
        (a, b) => a.zIndex - b.zIndex,
      );
      const index = reorderable.findIndex((layer) => layer.id === action.layerId);
      const swapWith = action.direction === 'forward' ? index + 1 : index - 1;
      if (index === -1 || swapWith < 0 || swapWith >= reorderable.length) return state;
      const a = reorderable[index];
      const b = reorderable[swapWith];
      const layers = state.project.layers.map((layer) => {
        if (layer.id === a.id) return { ...layer, zIndex: b.zIndex };
        if (layer.id === b.id) return { ...layer, zIndex: a.zIndex };
        return layer;
      });
      return { ...state, project: { ...state.project, layers } };
    }
    case 'SET_ANIMATION': {
      if (!state.project) return state;
      const animation =
        action.kind === 'none'
          ? null
          : { kind: action.kind, target: 'composition' as const, speed: state.project.animation?.speed ?? 1 };
      return { ...state, project: { ...state.project, animation } };
    }
    case 'SET_ANIMATION_SPEED': {
      if (!state.project?.animation) return state;
      return {
        ...state,
        project: { ...state.project, animation: { ...state.project.animation, speed: action.speed } },
      };
    }
    case 'SET_BACKGROUND': {
      if (!state.project) return state;
      const withoutBackground = state.project.layers.filter((layer) => layer.type !== 'background');
      const layers = action.layer ? [...withoutBackground, action.layer] : withoutBackground;
      return { ...state, project: { ...state.project, layers } };
    }
    case 'SET_EXPRESSION': {
      if (!state.project) return state;
      return {
        ...state,
        project: { ...state.project, expression: { ...state.project.expression, activeId: action.expressionId } },
      };
    }
    case 'ADD_EXPRESSION_VARIANT': {
      if (!state.project) return state;
      return {
        ...state,
        project: {
          ...state.project,
          expression: {
            activeId: action.expressionId,
            variants: { ...state.project.expression.variants, [action.expressionId]: action.url },
          },
        },
      };
    }
    case 'RESTORE_PROJECT':
      // Clears selection rather than trying to preserve it — the restored
      // snapshot may not contain whatever was previously selected (e.g.
      // undoing a delete brings back a different set of layers).
      return { ...state, project: action.project, selectedLayerId: null };
    case 'RENAME_PROJECT': {
      if (!state.project) return state;
      return { ...state, project: { ...state.project, name: action.name } };
    }
    case 'SAVE_START':
      return { ...state, saveStatus: 'saving', saveError: null };
    case 'SAVE_SUCCESS':
      return state.project
        ? { ...state, saveStatus: 'saved', project: { ...state.project, updatedAt: action.updatedAt } }
        : state;
    case 'SAVE_ERROR':
      return { ...state, saveStatus: 'error', saveError: action.error };
    default:
      return state;
  }
}

export function useAvatarProject(projectId: string) {
  const [state, dispatch] = useReducer(avatarProjectReducer, initialState);
  const { record: recordHistory, undo: undoHistory, redo: redoHistory, canUndo, canRedo, reset: resetHistory } =
    useAvatarHistory<AvatarProject>();

  // Purely transient UI state (never persisted, not undo-tracked) — lets the
  // canvas play a one-off "just landed" pop-in for a freshly added layer
  // without replaying it for every layer whenever a saved project loads.
  const [justAddedLayerId, setJustAddedLayerId] = useState<string | null>(null);
  useEffect(() => {
    if (!justAddedLayerId) return;
    const timeout = setTimeout(() => setJustAddedLayerId(null), 600);
    return () => clearTimeout(timeout);
  }, [justAddedLayerId]);

  // Records the pre-change project before dispatching, so undo has
  // something to restore to. LOAD_*/SELECT_LAYER/SAVE_* bypass this and
  // dispatch directly — selection and load/save lifecycle are never
  // undoable.
  const dispatchWithHistory = useCallback(
    (action: EditorAction) => {
      if (state.project) recordHistory(state.project);
      dispatch(action);
    },
    [state.project, recordHistory],
  );

  useEffect(() => {
    let isCurrent = true;
    dispatch({ type: 'LOAD_START' });
    resetHistory();
    getProjectStore()
      .getProject(projectId)
      .then((project) => {
        if (!isCurrent) return;
        if (project) {
          dispatch({ type: 'LOAD_SUCCESS', project: ensureExpressionState(ensureAvatarLayer(project)) });
        } else {
          dispatch({ type: 'LOAD_ERROR', error: 'Project not found.' });
        }
      })
      .catch((err) => {
        if (!isCurrent) return;
        dispatch({ type: 'LOAD_ERROR', error: err instanceof Error ? err.message : 'Failed to load project.' });
      });
    return () => {
      isCurrent = false;
    };
  }, [projectId, resetHistory]);

  const addLayer = useCallback(
    async (asset: PlaceableAsset) => {
      if (!state.project) return;
      const { width, height } = state.project.canvasSettings;

      // Scaled proportionally so the prop's rendered width always matches
      // the canvas width, regardless of the source image's natural size —
      // falls back to an unscaled 1:1 fit if the image can't be loaded here
      // (AvatarLayerNode's own load, via useKonvaImage, still renders it
      // normally either way).
      let naturalWidth = width;
      let naturalHeight = height;
      try {
        const size = await loadImageSize(asset.assetUrl);
        if (size.width > 0) {
          naturalWidth = size.width;
          naturalHeight = size.height;
        }
      } catch {
        // Keep the canvas-sized fallback above.
      }
      const scale = width / naturalWidth;
      const renderedWidth = naturalWidth * scale;
      const renderedHeight = naturalHeight * scale;

      if (!state.project) return;
      // New props always land on top of the current stack, including the
      // avatar — matches the exact same "on top of everything so far"
      // default used before the avatar could be reordered.
      const maxZIndex = state.project.layers
        .filter((layer) => layer.type !== 'background')
        .reduce((max, layer) => Math.max(max, layer.zIndex), -1);
      const layer: AvatarLayer = {
        id: crypto.randomUUID(),
        assetId: asset.id,
        type: 'prop',
        x: (width - renderedWidth) / 2,
        y: (height - renderedHeight) / 2,
        scaleX: scale,
        scaleY: scale,
        rotation: 0,
        zIndex: maxZIndex + 1,
      };
      dispatchWithHistory({ type: 'ADD_LAYER', layer });
      setJustAddedLayerId(layer.id);
    },
    [state.project, dispatchWithHistory],
  );

  const selectLayer = useCallback((layerId: string | null) => {
    dispatch({ type: 'SELECT_LAYER', layerId });
  }, []);

  const moveLayer = useCallback(
    (layerId: string, x: number, y: number) => {
      dispatchWithHistory({ type: 'MOVE_LAYER', layerId, x, y });
    },
    [dispatchWithHistory],
  );

  const updateLayer = useCallback(
    (layerId: string, patch: Partial<Pick<AvatarLayer, 'x' | 'y' | 'scaleX' | 'scaleY' | 'rotation'>>) => {
      dispatchWithHistory({ type: 'UPDATE_LAYER', layerId, patch });
    },
    [dispatchWithHistory],
  );

  const deleteLayer = useCallback(
    (layerId: string) => {
      // The avatar is never deletable — there'd be nothing left to add props to.
      const layer = state.project?.layers.find((l) => l.id === layerId);
      if (layer?.type === 'avatar') return;
      dispatchWithHistory({ type: 'DELETE_LAYER', layerId });
    },
    [state.project, dispatchWithHistory],
  );

  const duplicateLayer = useCallback(
    (layerId: string) => {
      if (!state.project) return;
      const source = state.project.layers.find((layer) => layer.id === layerId);
      // The avatar is one-of-a-kind — duplicating it wouldn't make sense.
      if (!source || source.type === 'avatar') return;
      const maxZIndex = state.project.layers
        .filter((layer) => layer.type !== 'background')
        .reduce((max, layer) => Math.max(max, layer.zIndex), -1);
      const newLayer: AvatarLayer = {
        ...source,
        id: crypto.randomUUID(),
        x: source.x + 16,
        y: source.y + 16,
        zIndex: maxZIndex + 1,
      };
      dispatchWithHistory({ type: 'DUPLICATE_LAYER', sourceLayerId: layerId, newLayer });
    },
    [state.project, dispatchWithHistory],
  );

  const bringForward = useCallback(
    (layerId: string) => {
      dispatchWithHistory({ type: 'REORDER_LAYER', layerId, direction: 'forward' });
    },
    [dispatchWithHistory],
  );

  const sendBackward = useCallback(
    (layerId: string) => {
      dispatchWithHistory({ type: 'REORDER_LAYER', layerId, direction: 'backward' });
    },
    [dispatchWithHistory],
  );

  const setAnimation = useCallback(
    (kind: AnimationKind) => {
      dispatchWithHistory({ type: 'SET_ANIMATION', kind });
    },
    [dispatchWithHistory],
  );

  const setAnimationSpeed = useCallback(
    (speed: number) => {
      dispatchWithHistory({ type: 'SET_ANIMATION_SPEED', speed });
    },
    [dispatchWithHistory],
  );

  const setBackground = useCallback(
    (asset: PlaceableAsset | null) => {
      if (!asset) {
        dispatchWithHistory({ type: 'SET_BACKGROUND', layer: null });
        return;
      }
      const layer: AvatarLayer = {
        id: crypto.randomUUID(),
        assetId: asset.id,
        type: 'background',
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        zIndex: 0,
      };
      dispatchWithHistory({ type: 'SET_BACKGROUND', layer });
    },
    [dispatchWithHistory],
  );

  const setExpression = useCallback(
    (expressionId: string | null) => {
      dispatchWithHistory({ type: 'SET_EXPRESSION', expressionId });
    },
    [dispatchWithHistory],
  );

  const addExpressionVariant = useCallback(
    (expressionId: string, url: string) => {
      dispatchWithHistory({ type: 'ADD_EXPRESSION_VARIANT', expressionId, url });
    },
    [dispatchWithHistory],
  );

  const undo = useCallback(() => {
    if (!state.project) return;
    const previous = undoHistory(state.project);
    if (previous) dispatch({ type: 'RESTORE_PROJECT', project: previous });
  }, [state.project, undoHistory]);

  const redo = useCallback(() => {
    if (!state.project) return;
    const next = redoHistory(state.project);
    if (next) dispatch({ type: 'RESTORE_PROJECT', project: next });
  }, [state.project, redoHistory]);

  const save = useCallback(async () => {
    if (!state.project) return;
    dispatch({ type: 'SAVE_START' });
    try {
      const saved = await getProjectStore().saveProject(state.project);
      dispatch({ type: 'SAVE_SUCCESS', updatedAt: saved.updatedAt });
    } catch (err) {
      dispatch({ type: 'SAVE_ERROR', error: err instanceof Error ? err.message : 'Failed to save project.' });
    }
  }, [state.project]);

  const renameProject = useCallback(
    async (name: string) => {
      if (!state.project) return;
      const previousName = state.project.name;
      // Persisted immediately, like the My Avatars dashboard's rename — not
      // batched into the next full Save, and not undo/redo-tracked.
      dispatch({ type: 'RENAME_PROJECT', name });
      try {
        await getProjectStore().renameProject(state.project.id, name);
      } catch {
        dispatch({ type: 'RENAME_PROJECT', name: previousName });
      }
    },
    [state.project],
  );

  const selectedLayer = state.project?.layers.find((layer) => layer.id === state.selectedLayerId) ?? null;

  return {
    project: state.project,
    selectedLayer,
    selectedLayerId: state.selectedLayerId,
    status: state.status,
    loadError: state.loadError,
    saveStatus: state.saveStatus,
    saveError: state.saveError,
    justAddedLayerId,
    addLayer,
    selectLayer,
    moveLayer,
    updateLayer,
    deleteLayer,
    duplicateLayer,
    bringForward,
    sendBackward,
    setAnimation,
    setAnimationSpeed,
    setBackground,
    setExpression,
    addExpressionVariant,
    undo,
    redo,
    canUndo,
    canRedo,
    save,
    renameProject,
  };
}
