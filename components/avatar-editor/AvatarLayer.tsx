'use client';

import { useLayoutEffect, useRef } from 'react';
import { Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { useKonvaImage } from '@/hooks/useKonvaImage';
import type { PlaceableAsset } from '@/types/asset';
import type { AvatarLayer } from '@/types/avatar-project';

export type LayerTransformPatch = Partial<Pick<AvatarLayer, 'x' | 'y' | 'scaleX' | 'scaleY' | 'rotation'>>;

interface AvatarLayerNodeProps {
  layer: AvatarLayer;
  asset: PlaceableAsset;
  isSelected: boolean;
  /** Plays a one-off pop-in bounce on mount — only ever true for the layer
   * just added this render pass, never for layers restored from a saved
   * project. */
  isNew?: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (patch: LayerTransformPatch) => void;
  nodeRef: (node: Konva.Image | null) => void;
  /** Forces an explicit render size instead of the image's natural pixel
   * size — used only for the avatar, so it keeps filling the canvas by
   * default the same way it always has (props omit this). */
  width?: number;
  height?: number;
}

export function AvatarLayerNode({
  layer,
  asset,
  isSelected,
  isNew = false,
  onSelect,
  onDragEnd,
  onTransformEnd,
  nodeRef,
  width,
  height,
}: AvatarLayerNodeProps) {
  const image = useKonvaImage(asset.assetUrl);
  const nodeInstanceRef = useRef<Konva.Image | null>(null);

  // useLayoutEffect (not useEffect) so the scale is forced to 0 before the
  // browser paints — otherwise the node would flash at full size for one
  // frame before the tween kicks in. Empty deps: this only fires once, when
  // this specific layer's node first mounts (matches the `key={layer.id}` in
  // AvatarCanvas), so it never replays on later re-renders of the same layer.
  useLayoutEffect(() => {
    if (!isNew) return;
    const node = nodeInstanceRef.current;
    if (!node) return;
    node.scaleX(0);
    node.scaleY(0);
    const tween = new Konva.Tween({
      node,
      scaleX: layer.scaleX,
      scaleY: layer.scaleY,
      duration: 0.4,
      easing: Konva.Easings.BackEaseOut,
    });
    tween.play();
    return () => tween.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <KonvaImage
      ref={(node) => {
        nodeInstanceRef.current = node;
        nodeRef(node);
      }}
      image={image ?? undefined}
      x={layer.x}
      y={layer.y}
      width={width}
      height={height}
      scaleX={layer.scaleX}
      scaleY={layer.scaleY}
      rotation={layer.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => onDragEnd(e.target.x(), e.target.y())}
      onTransformEnd={(e: Konva.KonvaEventObject<Event>) => {
        const node = e.target;
        onTransformEnd({
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation(),
        });
      }}
      stroke={isSelected ? '#2563eb' : undefined}
      strokeWidth={isSelected ? 2 : 0}
    />
  );
}
