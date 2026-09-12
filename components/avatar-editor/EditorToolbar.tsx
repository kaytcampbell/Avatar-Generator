import { Download, Undo2, Redo2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfettiBurst } from './ConfettiBurst';
import { EditableProjectName } from './EditableProjectName';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import type { SaveStatus } from '@/hooks/useAvatarProject';

interface EditorToolbarProps {
  projectName: string;
  onRenameProject: (name: string) => void;
  saveStatus: SaveStatus;
  onSave: () => void;
  onExportPNG: () => void;
  onExportGIF: () => void;
  isExportingGif: boolean;
  /** Incremented on every successful export — fires a confetti burst. */
  exportCelebration: number;
  hasAnimation: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function EditorToolbar({
  projectName,
  onRenameProject,
  saveStatus,
  onSave,
  onExportPNG,
  onExportGIF,
  isExportingGif,
  exportCelebration,
  hasAnimation,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <EditableProjectName name={projectName} onRename={onRenameProject} />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={onUndo} disabled={!canUndo} aria-label="Undo">
            <Undo2 className="size-4" aria-hidden="true" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onRedo} disabled={!canRedo} aria-label="Redo">
            <Redo2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <SaveStatusIndicator status={saveStatus} />
        <div className="relative flex items-center gap-3">
          <ConfettiBurst trigger={exportCelebration} />
          <Button size="sm" variant="outline" onClick={onExportPNG}>
            <Download className="size-4" aria-hidden="true" />
            PNG
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onExportGIF}
            disabled={!hasAnimation || isExportingGif}
            title={hasAnimation ? undefined : 'Set an animation to export a GIF'}
          >
            {isExportingGif ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}
            {isExportingGif ? 'Exporting...' : 'GIF'}
          </Button>
        </div>
        <Button size="sm" onClick={onSave} disabled={saveStatus === 'saving'}>
          Save
        </Button>
      </div>
    </div>
  );
}
