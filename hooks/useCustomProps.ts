import { useCallback, useEffect, useReducer } from 'react';
import { getCustomPropStore } from '@/lib/storage';
import type { CustomProp } from '@/types/custom-prop';

export type CustomPropsStatus = 'loading' | 'ready' | 'error';

interface CustomPropsState {
  props: CustomProp[];
  status: CustomPropsStatus;
  error: string | null;
}

type CustomPropsAction =
  | { type: 'LOAD_SUCCESS'; props: CustomProp[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'SET_PROPS'; props: CustomProp[] }
  | { type: 'SET_ERROR'; error: string };

const initialState: CustomPropsState = { props: [], status: 'loading', error: null };

// A useReducer dispatch (rather than plain useState setters) so the
// mount-time load effect below doesn't trip react-hooks/set-state-in-effect
// — same fix as useAvatarProjects.ts.
function reducer(state: CustomPropsState, action: CustomPropsAction): CustomPropsState {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      return { props: action.props, status: 'ready', error: null };
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'SET_PROPS':
      return { ...state, props: action.props };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    default:
      return state;
  }
}

/**
 * Takes `userId` as a param rather than resolving it internally — keeps this
 * a thin data-fetching layer, consistent with useAvatarProjects. `userId` is
 * nullable because EditorShell (unlike the server-gated /projects page)
 * doesn't know the signed-in user synchronously — while it's null (auth
 * still resolving, or signed out) this resolves to an empty, non-loading
 * list rather than querying the store with an invalid id.
 */
export function useCustomProps(userId: string | null) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refresh = useCallback(async () => {
    if (!userId) {
      dispatch({ type: 'LOAD_SUCCESS', props: [] });
      return;
    }
    try {
      const list = await getCustomPropStore().listCustomProps(userId);
      dispatch({ type: 'LOAD_SUCCESS', props: list });
    } catch (err) {
      dispatch({ type: 'LOAD_ERROR', error: err instanceof Error ? err.message : 'Failed to load custom props.' });
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCustomProp = useCallback(
    async (prop: CustomProp) => {
      const previous = state.props;
      dispatch({ type: 'SET_PROPS', props: [prop, ...previous] });
      try {
        await getCustomPropStore().createCustomProp(prop);
      } catch (err) {
        dispatch({ type: 'SET_ERROR', error: err instanceof Error ? err.message : 'Failed to save custom prop.' });
        dispatch({ type: 'SET_PROPS', props: previous });
      }
    },
    [state.props],
  );

  const renameCustomProp = useCallback(
    async (id: string, name: string) => {
      const previous = state.props;
      dispatch({ type: 'SET_PROPS', props: previous.map((prop) => (prop.id === id ? { ...prop, name } : prop)) });
      try {
        await getCustomPropStore().renameCustomProp(id, name);
      } catch (err) {
        dispatch({ type: 'SET_ERROR', error: err instanceof Error ? err.message : 'Failed to rename custom prop.' });
        dispatch({ type: 'SET_PROPS', props: previous });
      }
    },
    [state.props],
  );

  const deleteCustomProp = useCallback(
    async (id: string) => {
      const previous = state.props;
      dispatch({ type: 'SET_PROPS', props: previous.filter((prop) => prop.id !== id) });
      try {
        await getCustomPropStore().deleteCustomProp(id);
      } catch (err) {
        dispatch({ type: 'SET_ERROR', error: err instanceof Error ? err.message : 'Failed to delete custom prop.' });
        dispatch({ type: 'SET_PROPS', props: previous });
      }
    },
    [state.props],
  );

  // A separate bulk method rather than calling deleteCustomProp in a loop —
  // each call there optimistically filters from the same pre-update
  // `state.props` snapshot, so looping it drops all but the last deletion
  // (each dispatch overwrites the previous one with a list still containing
  // the earlier "deleted" ids). Filtering the whole id set in one dispatch
  // avoids the race.
  const deleteCustomProps = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;
      const idSet = new Set(ids);
      const previous = state.props;
      dispatch({ type: 'SET_PROPS', props: previous.filter((prop) => !idSet.has(prop.id)) });
      try {
        await Promise.all(ids.map((id) => getCustomPropStore().deleteCustomProp(id)));
      } catch (err) {
        dispatch({ type: 'SET_ERROR', error: err instanceof Error ? err.message : 'Failed to delete custom props.' });
        dispatch({ type: 'SET_PROPS', props: previous });
      }
    },
    [state.props],
  );

  return {
    customProps: state.props,
    status: state.status,
    error: state.error,
    refresh,
    createCustomProp,
    renameCustomProp,
    deleteCustomProp,
    deleteCustomProps,
  };
}
