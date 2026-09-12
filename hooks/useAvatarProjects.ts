import { useCallback, useEffect, useReducer } from 'react';
import { getProjectStore } from '@/lib/storage';
import type { AvatarProjectSummary } from '@/lib/storage';

export type ProjectsStatus = 'loading' | 'ready' | 'error';

interface ProjectsState {
  projects: AvatarProjectSummary[];
  status: ProjectsStatus;
  error: string | null;
}

type ProjectsAction =
  | { type: 'LOAD_SUCCESS'; projects: AvatarProjectSummary[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'SET_PROJECTS'; projects: AvatarProjectSummary[] }
  | { type: 'SET_ERROR'; error: string };

const initialState: ProjectsState = { projects: [], status: 'loading', error: null };

// A useReducer dispatch (rather than plain useState setters) so the
// mount-time load effect below stays consistent with useAvatarProject.ts's
// same load-on-mount pattern.
function reducer(state: ProjectsState, action: ProjectsAction): ProjectsState {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      return { projects: action.projects, status: 'ready', error: null };
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'SET_PROJECTS':
      return { ...state, projects: action.projects };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    default:
      return state;
  }
}

/**
 * Takes `userId` as a param rather than resolving it internally — keeps this
 * a thin data-fetching layer, consistent with useAvatarProject not doing its
 * own auth checks either. The page-level auth gate resolves the user first.
 */
export function useAvatarProjects(userId: string) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refresh = useCallback(async () => {
    try {
      const list = await getProjectStore().listProjects(userId);
      dispatch({ type: 'LOAD_SUCCESS', projects: list });
    } catch (err) {
      dispatch({ type: 'LOAD_ERROR', error: err instanceof Error ? err.message : 'Failed to load projects.' });
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const deleteProject = useCallback(
    async (id: string) => {
      const previous = state.projects;
      dispatch({ type: 'SET_PROJECTS', projects: previous.filter((project) => project.id !== id) });
      try {
        await getProjectStore().deleteProject(id);
      } catch (err) {
        dispatch({ type: 'SET_ERROR', error: err instanceof Error ? err.message : 'Failed to delete project.' });
        dispatch({ type: 'SET_PROJECTS', projects: previous });
      }
    },
    [state.projects],
  );

  const renameProject = useCallback(
    async (id: string, name: string) => {
      const previous = state.projects;
      dispatch({
        type: 'SET_PROJECTS',
        projects: previous.map((project) => (project.id === id ? { ...project, name } : project)),
      });
      try {
        await getProjectStore().renameProject(id, name);
      } catch (err) {
        dispatch({ type: 'SET_ERROR', error: err instanceof Error ? err.message : 'Failed to rename project.' });
        dispatch({ type: 'SET_PROJECTS', projects: previous });
      }
    },
    [state.projects],
  );

  return { projects: state.projects, status: state.status, error: state.error, refresh, deleteProject, renameProject };
}
