import { Ban, ArrowUpDown, Waves, CircleDot, Zap, RotateCw, Repeat, Wind, Activity, ChevronsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnimationKind, AvatarAnimation } from '@/types/avatar-project';

interface AnimationPanelProps {
  animation: AvatarAnimation | null;
  onSetAnimation: (kind: AnimationKind) => void;
  onSetSpeed: (speed: number) => void;
}

const ANIMATION_OPTIONS: { kind: AnimationKind; label: string; icon: typeof Ban }[] = [
  { kind: 'none', label: 'None', icon: Ban },
  { kind: 'bounce', label: 'Bounce', icon: ArrowUpDown },
  { kind: 'float', label: 'Float', icon: Waves },
  { kind: 'pulse', label: 'Pulse', icon: CircleDot },
  { kind: 'shake', label: 'Shake', icon: Zap },
  { kind: 'spin', label: 'Spin', icon: RotateCw },
  { kind: 'wiggle', label: 'Wiggle', icon: Repeat },
  { kind: 'wave', label: 'Wave', icon: Wind },
  { kind: 'heartbeat', label: 'Heartbeat', icon: Activity },
  { kind: 'jump', label: 'Jump', icon: ChevronsUp },
];

const SPEED_OPTIONS: { speed: number; label: string }[] = [
  { speed: 0.5, label: '0.5x' },
  { speed: 1, label: '1x' },
  { speed: 1.5, label: '1.5x' },
  { speed: 2, label: '2x' },
];

export function AnimationPanel({ animation, onSetAnimation, onSetSpeed }: AnimationPanelProps) {
  const activeKind = animation?.kind ?? 'none';
  const activeSpeed = animation?.speed ?? 1;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <span className="font-heading text-xs font-bold text-foreground">Animation</span>
        <div className="grid grid-cols-2 gap-2">
          {ANIMATION_OPTIONS.map(({ kind, label, icon: Icon }) => (
            <Button
              key={kind}
              variant={activeKind === kind ? 'default' : 'outline'}
              size="sm"
              aria-pressed={activeKind === kind}
              onClick={() => onSetAnimation(kind)}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-heading text-xs font-bold text-foreground">Speed</span>
        <div className="grid grid-cols-4 gap-2">
          {SPEED_OPTIONS.map(({ speed, label }) => (
            <Button
              key={speed}
              variant={activeSpeed === speed ? 'default' : 'outline'}
              size="sm"
              aria-pressed={activeSpeed === speed}
              disabled={activeKind === 'none'}
              onClick={() => onSetSpeed(speed)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
