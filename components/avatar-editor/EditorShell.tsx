'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAvatarProject } from '@/hooks/useAvatarProject';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useCustomProps } from '@/hooks/useCustomProps';
import { createClient } from '@/lib/supabase/client';
import { downloadDataUrl, downloadBlob, slugifyFilename } from '@/lib/export/downloadDataUrl';
import { encodeAnimatedGif } from '@/lib/export/gif';
import { AssetLibrary } from './AssetLibrary';
import { EditorToolbar } from './EditorToolbar';
import { PropertiesPanel } from './PropertiesPanel';
import { AnimationPanel } from './AnimationPanel';
import { ExpressionPanel } from './ExpressionPanel';
import type { AvatarCanvasExports } from './AvatarCanvas';

// Konva touches canvas/DOM APIs and must never render server-side.
const AvatarCanvas = dynamic(() => import('./AvatarCanvas').then((mod) => mod.AvatarCanvas), {
  ssr: false,
  loading: () => <Skeleton className="aspect-square w-full max-w-lg" />,
});

interface EditorShellProps {
  projectId: string;
}

export function EditorShell({ projectId }: EditorShellProps) {
  const {
    project,
    selectedLayer,
    selectedLayerId,
    status,
    loadError,
    saveStatus,
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
  } = useAvatarProject(projectId);

  useKeyboardShortcuts({ selectedLayerId, onDelete: deleteLayer, onUndo: undo, onRedo: redo });

  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);
  const {
    customProps,
    status: customPropsStatus,
    error: customPropsError,
    createCustomProp,
    renameCustomProp,
    deleteCustomProp,
    deleteCustomProps,
  } = useCustomProps(userId);

  // A "you made a thing!" confetti moment on a successful export — a counter
  // (not a boolean) so it replays every time, even back-to-back exports.
  const [exportCelebration, setExportCelebration] = useState(0);

  const exportFnRef = useRef<AvatarCanvasExports | null>(null);
  const handleExportReady = useCallback((exportFns: AvatarCanvasExports) => {
    exportFnRef.current = exportFns;
  }, []);
  const handleExportPNG = useCallback(() => {
    const dataUrl = exportFnRef.current?.exportPNG(2);
    if (!dataUrl) return;
    downloadDataUrl(dataUrl, `${slugifyFilename(project?.name ?? '')}.png`);
    setExportCelebration((n) => n + 1);
  }, [project?.name]);

  const [isExportingGif, setIsExportingGif] = useState(false);
  const handleExportGIF = useCallback(async () => {
    const canvas = exportFnRef.current?.getStageCanvas(1);
    if (!canvas || !project) return;
    setIsExportingGif(true);
    try {
      const bytes = await encodeAnimatedGif(canvas, project.animation?.kind ?? 'none', project.animation?.speed ?? 1);
      // Re-wrapped in a fresh Uint8Array: `bytes.buffer` types as the broader
      // ArrayBufferLike (which could be a SharedArrayBuffer), not the plain
      // ArrayBuffer Blob's constructor requires.
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: 'image/gif' }), `${slugifyFilename(project.name)}.gif`);
      setExportCelebration((n) => n + 1);
    } finally {
      setIsExportingGif(false);
    }
  }, [project]);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Skeleton className="aspect-square w-full max-w-lg" />
      </div>
    );
  }

  if (status === 'error' || !project) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Alert variant="destructive" className="max-w-sm">
            <AlertDescription>{loadError ?? 'Project not found.'}</AlertDescription>
          </Alert>
          <Button asChild variant="outline">
            <Link href="/create">Back to Create</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Avatar and props share one z-order (a background is never stacked with them).
  const sortedLayers = project.layers
    .filter((layer) => layer.type !== 'background')
    .sort((a, b) => a.zIndex - b.zIndex);
  const isTopmost = !selectedLayer || sortedLayers.at(-1)?.id === selectedLayer.id;
  const isBottommost = !selectedLayer || sortedLayers.at(0)?.id === selectedLayer.id;
  const activeBackgroundAssetId = project.layers.find((layer) => layer.type === 'background')?.assetId ?? null;
  // Which image to actually render for the avatar layer — the neutral base,
  // or a cached AI-regenerated expression variant if one is active.
  const activeAvatarUrl = project.expression.activeId
    ? (project.expression.variants[project.expression.activeId] ?? project.baseAvatarUrl)
    : project.baseAvatarUrl;

  return (
    <div className="flex flex-1 flex-col">
      <EditorToolbar
        projectName={project.name}
        onRenameProject={renameProject}
        saveStatus={saveStatus}
        onSave={save}
        onExportPNG={handleExportPNG}
        onExportGIF={handleExportGIF}
        isExportingGif={isExportingGif}
        exportCelebration={exportCelebration}
        hasAnimation={project.animation !== null}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-130 shrink-0 border-r p-4 overflow-scroll h-screen">
          <AssetLibrary
            onAddAsset={addLayer}
            onSetBackground={setBackground}
            onRemoveBackground={() => setBackground(null)}
            activeBackgroundAssetId={activeBackgroundAssetId}
            userId={userId}
            customProps={customProps}
            customPropsStatus={customPropsStatus}
            customPropsError={customPropsError}
            onSaveCustomProp={createCustomProp}
            onRenameCustomProp={renameCustomProp}
            onDeleteCustomProp={deleteCustomProp}
            onDeleteCustomProps={deleteCustomProps}
          />
        </aside>
        <main className="flex flex-1 items-center justify-center overflow-auto p-8">
          <AvatarCanvas
            baseAvatarUrl={activeAvatarUrl}
            layers={project.layers}
            canvasSettings={project.canvasSettings}
            animation={project.animation}
            selectedLayerId={selectedLayerId}
            onSelectLayer={selectLayer}
            onMoveLayer={moveLayer}
            onUpdateLayer={updateLayer}
            onExportReady={handleExportReady}
            customProps={customProps}
            justAddedLayerId={justAddedLayerId}
          />
        </main>
        <aside className="flex w-130 shrink-0 flex-col border-l">
          <div className="overflow-auto">
            <PropertiesPanel
              selectedLayer={selectedLayer}
              isTopmost={isTopmost}
              isBottommost={isBottommost}
              onDelete={() => selectedLayer && deleteLayer(selectedLayer.id)}
              onDuplicate={() => selectedLayer && duplicateLayer(selectedLayer.id)}
              onBringForward={() => selectedLayer && bringForward(selectedLayer.id)}
              onSendBackward={() => selectedLayer && sendBackward(selectedLayer.id)}
            />
          </div>
          <Separator />
          <ExpressionPanel
            baseAvatarUrl={project.baseAvatarUrl}
            expression={project.expression}
            onSetExpression={setExpression}
            onAddExpressionVariant={addExpressionVariant}
          />
          <Separator />
          <AnimationPanel
            animation={project.animation}
            onSetAnimation={setAnimation}
            onSetSpeed={setAnimationSpeed}
          />
        </aside>
      </div>
    </div>
  );
}
