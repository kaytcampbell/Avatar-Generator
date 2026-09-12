export type LayerType = 'prop' | 'background' | 'avatar';

export interface AvatarLayer {
  id: string;
  assetId: string;
  type: LayerType;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  zIndex: number;
}

export type AnimationKind =
  | 'none'
  | 'bounce'
  | 'float'
  | 'pulse'
  | 'shake'
  | 'spin'
  | 'wiggle'
  | 'wave'
  | 'heartbeat'
  | 'jump';

export interface AvatarAnimation {
  kind: AnimationKind;
  /** 'composition' animates the whole avatar; otherwise a list of layer ids. */
  target: 'composition' | string[];
  /** Multiplier on the animation's cycle rate — 1 is normal speed, 2 is twice as fast. */
  speed: number;
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface AvatarExpressionState {
  /** null means the original, neutral baseAvatarUrl is shown. */
  activeId: string | null;
  /** Cache of AI-generated expression variants, keyed by expression id, so
   * switching back to one already generated is instant and free. */
  variants: Record<string, string>;
}

export interface AvatarProject {
  id: string;
  userId: string;
  name: string;
  baseAvatarUrl: string;
  layers: AvatarLayer[];
  animation: AvatarAnimation | null;
  expression: AvatarExpressionState;
  canvasSettings: CanvasSettings;
  createdAt: string;
  updatedAt: string;
}
