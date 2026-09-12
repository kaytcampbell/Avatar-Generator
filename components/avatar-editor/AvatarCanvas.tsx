'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import { useAnimate, useReducedMotion } from 'framer-motion';
import type Konva from 'konva';
import { useKonvaImage } from '@/hooks/useKonvaImage';
import { AvatarLayerNode, type LayerTransformPatch } from './AvatarLayer';
import { getAssetById } from '@/lib/assets/placeholder-assets';
import { scaleTransition } from '@/lib/animation/motionSpeed';
import type { PlaceableAsset } from '@/types/asset';
import type { AnimationKind, AvatarAnimation, AvatarLayer, CanvasSettings } from '@/types/avatar-project';

// Every entry sets all four axes explicitly (even ones it doesn't animate)
// so switching between kinds always resets the untouched axes to baseline
// instead of leaving stale offsets from whichever kind was active before.
//
// Framer Motion applies a single `transition` to every key in `animate`
// unless given a per-key transition map — a shared `repeat: Infinity` would
// otherwise make the "reset to baseline" axes oscillate forever too. Each
// entry below gives only its active axis a looping transition; the rest get
// a quick one-time settle.
const SETTLE = { duration: 0.2 };

const ANIMATIONS: Record<AnimationKind, { animate: Record<string, number | number[]>; transition: Record<string, object> }> = {
  none: {
    animate: { x: 0, y: 0, scale: 1, rotate: 0 },
    transition: { x: SETTLE, y: SETTLE, scale: SETTLE, rotate: SETTLE },
  },
  bounce: {
    animate: { x: 0, y: [0, -20, 0], scale: 1, rotate: 0 },
    transition: {
      x: SETTLE,
      y: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
      scale: SETTLE,
      rotate: SETTLE,
    },
  },
  float: {
    animate: { x: 0, y: [0, -10, 0], scale: 1, rotate: 0 },
    transition: {
      x: SETTLE,
      y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
      scale: SETTLE,
      rotate: SETTLE,
    },
  },
  pulse: {
    animate: { x: 0, y: 0, scale: [1, 1.08, 1], rotate: 0 },
    transition: {
      x: SETTLE,
      y: SETTLE,
      scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
      rotate: SETTLE,
    },
  },
  shake: {
    animate: { x: [0, -6, 6, -6, 6, 0], y: 0, scale: 1, rotate: 0 },
    transition: {
      x: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
      y: SETTLE,
      scale: SETTLE,
      rotate: SETTLE,
    },
  },
  spin: {
    animate: { x: 0, y: 0, scale: 1, rotate: [0, 360] },
    transition: {
      x: SETTLE,
      y: SETTLE,
      scale: SETTLE,
      rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
    },
  },
  wiggle: {
    animate: { x: 0, y: 0, scale: 1, rotate: [0, -8, 8, -8, 8, 0] },
    transition: {
      x: SETTLE,
      y: SETTLE,
      scale: SETTLE,
      rotate: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  wave: {
    animate: { x: [0, -12, 12, 0], y: 0, scale: 1, rotate: 0 },
    transition: {
      x: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
      y: SETTLE,
      scale: SETTLE,
      rotate: SETTLE,
    },
  },
  heartbeat: {
    animate: { x: 0, y: 0, scale: [1, 1.15, 1, 1.15, 1], rotate: 0 },
    transition: {
      x: SETTLE,
      y: SETTLE,
      scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
      rotate: SETTLE,
    },
  },
  jump: {
    animate: { x: 0, y: [0, -30, 0], scale: [1, 1, 0.85, 1.1, 1], rotate: 0 },
    transition: {
      x: SETTLE,
      y: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' },
      scale: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' },
      rotate: SETTLE,
    },
  },
};

export interface AvatarCanvasExports {
  /** Static composition as a PNG data URL, selection UI hidden during capture. */
  exportPNG: (pixelRatio?: number) => string | null;
  /** Raw static-composition canvas (no CSS animation transform baked in) — the
   * source GIF export samples the animation's motion onto, frame by frame. */
  getStageCanvas: (pixelRatio?: number) => HTMLCanvasElement | null;
}

interface AvatarCanvasProps {
  baseAvatarUrl: string;
  layers: AvatarLayer[];
  canvasSettings: CanvasSettings;
  animation: AvatarAnimation | null;
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string | null) => void;
  onMoveLayer: (layerId: string, x: number, y: number) => void;
  onUpdateLayer: (layerId: string, patch: LayerTransformPatch) => void;
  onExportReady?: (exportFns: AvatarCanvasExports) => void;
  customProps?: PlaceableAsset[];
  /** The layer id (if any) that was just added this render pass — plays a
   * one-off pop-in bounce, never replayed on later re-renders. */
  justAddedLayerId?: string | null;
}

export function AvatarCanvas({
  baseAvatarUrl,
  layers,
  canvasSettings,
  animation,
  selectedLayerId,
  onSelectLayer,
  onMoveLayer,
  onUpdateLayer,
  onExportReady,
  customProps = [],
  justAddedLayerId = null,
}: AvatarCanvasProps) {
  const [animationScope, animateScope] = useAnimate<HTMLDivElement>();
  const prefersReducedMotion = useReducedMotion();
  const activeAnimation = ANIMATIONS[prefersReducedMotion ? 'none' : (animation?.kind ?? 'none')];
  // Memoized so its identity only changes when kind/speed actually change —
  // otherwise the effect below would restart the loop (visibly resetting its
  // phase) on every unrelated re-render, e.g. dragging a prop layer.
  const activeTransition = useMemo(
    () => scaleTransition(activeAnimation.transition, animation?.speed ?? 1),
    [activeAnimation, animation?.speed],
  );
  // Driven imperatively rather than via the declarative `animate`/`transition`
  // props: Motion only restarts a repeat:Infinity loop when the *target*
  // values change, so a speed-only change (same keyframes, new duration)
  // would otherwise be silently ignored on an already-running animation.
  useEffect(() => {
    if (!animationScope.current) return;
    animateScope(animationScope.current, activeAnimation.animate, activeTransition);
  }, [animationScope, animateScope, activeAnimation, activeTransition]);
  const backgroundLayer = layers.find((layer) => layer.type === 'background');
  const backgroundAsset = backgroundLayer
    ? (getAssetById(backgroundLayer.assetId) ?? customProps.find((p) => p.id === backgroundLayer.assetId))
    : undefined;
  const backgroundImage = useKonvaImage(backgroundAsset?.assetUrl ?? null);
  // Avatar and props share one interactive Layer, ordered together by
  // zIndex, so either can be reordered in front of or behind the other.
  const interactiveLayers = layers
    .filter((layer) => layer.type === 'prop' || layer.type === 'avatar')
    .sort((a, b) => a.zIndex - b.zIndex);
  const nodeMap = useRef(new Map<string, Konva.Image>());
  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const selectedNode = selectedLayerId ? nodeMap.current.get(selectedLayerId) : null;
    transformer.nodes(selectedNode ? [selectedNode] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedLayerId, interactiveLayers.length]);

  // Hides the Transformer handles and each prop's selection stroke around a
  // capture, synchronously via refs (not React state) so the UI never
  // flashes a deselected state during export.
  function withHiddenSelectionUI<T>(capture: () => T): T {
    const previousSelection = transformerRef.current?.nodes() ?? [];
    transformerRef.current?.nodes([]);
    const strokeBackups: [Konva.Image, number][] = [];
    nodeMap.current.forEach((node) => {
      strokeBackups.push([node, node.strokeWidth()]);
      node.strokeWidth(0);
    });
    stageRef.current?.batchDraw();
    const result = capture();
    strokeBackups.forEach(([node, width]) => node.strokeWidth(width));
    transformerRef.current?.nodes(previousSelection);
    stageRef.current?.batchDraw();
    return result;
  }

  useEffect(() => {
    onExportReady?.({
      exportPNG: (pixelRatio = 2) =>
        withHiddenSelectionUI(() => stageRef.current?.toDataURL({ pixelRatio, mimeType: 'image/png' }) ?? null),
      getStageCanvas: (pixelRatio = 1) => withHiddenSelectionUI(() => stageRef.current?.toCanvas({ pixelRatio }) ?? null),
    });
  }, [onExportReady]);

  function handleStageMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    if (e.target === e.target.getStage()) {
      onSelectLayer(null);
    }
  }

  return (
    <div ref={animationScope} className="inline-block">
      <Stage
        ref={stageRef}
        width={canvasSettings.width}
        height={canvasSettings.height}
        onMouseDown={handleStageMouseDown}
        className="rounded-xl border bg-muted/30"
      >
        {/* Background: bottom-most, never interactive — a simple full-bleed backdrop, not a draggable/resizable layer like props. */}
        <Layer listening={false}>
          {backgroundImage && (
            <KonvaImage image={backgroundImage} width={canvasSettings.width} height={canvasSettings.height} />
          )}
        </Layer>
        <Layer>
          {interactiveLayers.map((layer) => {
            const asset =
              layer.type === 'avatar'
                ? { id: layer.id, name: 'Avatar', assetUrl: baseAvatarUrl, thumbnailUrl: baseAvatarUrl }
                : (getAssetById(layer.assetId) ?? customProps.find((p) => p.id === layer.assetId));
            if (!asset) return null;
            return (
              <AvatarLayerNode
                key={layer.id}
                layer={layer}
                asset={asset}
                width={layer.type === 'avatar' ? canvasSettings.width : undefined}
                height={layer.type === 'avatar' ? canvasSettings.height : undefined}
                isSelected={layer.id === selectedLayerId}
                isNew={layer.id === justAddedLayerId}
                onSelect={() => onSelectLayer(layer.id)}
                onDragEnd={(x, y) => onMoveLayer(layer.id, x, y)}
                onTransformEnd={(patch) => onUpdateLayer(layer.id, patch)}
                nodeRef={(node) => {
                  if (node) nodeMap.current.set(layer.id, node);
                  else nodeMap.current.delete(layer.id);
                }}
              />
            );
          })}
          <Transformer
            ref={transformerRef}
            rotateEnabled
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            boundBoxFunc={(oldBox, newBox) => (newBox.width < 12 || newBox.height < 12 ? oldBox : newBox)}
          />
        </Layer>
      </Stage>
    </div>
  );
}
