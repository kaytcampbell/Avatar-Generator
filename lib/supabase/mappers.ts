import type {
  AvatarAnimation,
  AvatarExpressionState,
  AvatarLayer,
  AvatarProject,
  CanvasSettings,
  LayerType,
} from '@/types/avatar-project';
import { createDefaultExpressionState } from '@/lib/expression-state';

export interface AvatarProjectRow {
  id: string;
  user_id: string;
  name: string;
  base_avatar_url: string;
  animation: AvatarAnimation | null;
  expression: AvatarExpressionState | null;
  canvas_settings: CanvasSettings;
  created_at: string;
  updated_at: string;
}

export interface AvatarLayerRow {
  id: string;
  avatar_project_id: string;
  asset_id: string;
  type: LayerType;
  x: number;
  y: number;
  scale_x: number;
  scale_y: number;
  rotation: number;
  z_index: number;
}

export function toAvatarLayer(row: AvatarLayerRow): AvatarLayer {
  return {
    id: row.id,
    assetId: row.asset_id,
    type: row.type,
    x: row.x,
    y: row.y,
    scaleX: row.scale_x,
    scaleY: row.scale_y,
    rotation: row.rotation,
    zIndex: row.z_index,
  };
}

export function toAvatarProject(row: AvatarProjectRow, layerRows: AvatarLayerRow[]): AvatarProject {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    baseAvatarUrl: row.base_avatar_url,
    layers: layerRows.map(toAvatarLayer),
    animation: row.animation,
    expression: row.expression ?? createDefaultExpressionState(),
    canvasSettings: row.canvas_settings,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toProjectRow(project: AvatarProject): AvatarProjectRow {
  return {
    id: project.id,
    user_id: project.userId,
    name: project.name,
    base_avatar_url: project.baseAvatarUrl,
    animation: project.animation,
    expression: project.expression,
    canvas_settings: project.canvasSettings,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

export function toLayerRow(layer: AvatarLayer, projectId: string): AvatarLayerRow {
  return {
    id: layer.id,
    avatar_project_id: projectId,
    asset_id: layer.assetId,
    type: layer.type,
    x: layer.x,
    y: layer.y,
    scale_x: layer.scaleX,
    scale_y: layer.scaleY,
    rotation: layer.rotation,
    z_index: layer.zIndex,
  };
}
