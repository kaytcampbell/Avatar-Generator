import Image from 'next/image';
import { Undo2, Redo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_TABS = ['Glasses', 'Accessories', 'Backgrounds', 'My Props'];

const MOCK_PROPS = [
  { src: '/assets/props/accessories/bowtie.svg', label: 'Bowtie' },
  { src: '/assets/props/accessories/mustache.svg', label: 'Mustache' },
  { src: '/assets/props/accessories/earrings.svg', label: 'Earrings' },
];

const MOCK_ANIMATIONS = ['None', 'Bounce', 'Float', 'Pulse', 'Shake', 'Spin', 'Wiggle', 'Wave', 'Heartbeat', 'Jump'];

/**
 * A non-interactive recreation of the editor's chrome, purely decorative —
 * used as the hero illustration on the marketing homepage. Not wired to any
 * real state; every label/value here is hardcoded to loosely match a typical
 * editing session.
 */
export function EditorPreviewMock() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-md overflow-hidden rounded-2xl border bg-white text-[11px] shadow-2xl"
    >
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="font-heading text-slate-700">Avatar Studio</span>
        <div className="flex items-center gap-2 text-slate-400">
          <span>My Avatars</span>
          <span className="hidden sm:inline">kayt.wilson@duradigital.com</span>
          <span>Sign out</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="font-semibold text-slate-700">Untitled Avatar</span>
        <div className="flex items-center gap-1.5">
          <Undo2 className="size-3.5 text-slate-300" aria-hidden="true" />
          <Redo2 className="size-3.5 text-slate-300" aria-hidden="true" />
          <span className="rounded-full border px-2 py-0.5 text-slate-400">Not saved yet</span>
          <span className="rounded-md border px-2 py-0.5 text-slate-500">PNG</span>
          <span className="rounded-md border px-2 py-0.5 text-slate-500">GIF</span>
          <span className="rounded-md bg-slate-900 px-2 py-0.5 font-semibold text-white">Save</span>
        </div>
      </div>

      <div className="flex">
        <div className="w-28 shrink-0 border-r">
          <div className="flex flex-wrap border-b">
            {MOCK_TABS.map((tab, i) => (
              <span
                key={tab}
                className={cn(
                  'truncate px-1.5 py-1.5 text-[10px]',
                  i === 1 ? 'bg-slate-100 font-semibold text-slate-700' : 'text-slate-400',
                )}
              >
                {tab}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5 p-1.5">
            {MOCK_PROPS.map((prop) => (
              <div key={prop.label} className="flex flex-col items-center gap-1 rounded-lg border p-1.5">
                <Image src={prop.src} alt="" width={28} height={20} className="h-auto w-7" />
                <span className="text-slate-500">{prop.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center bg-slate-50 p-6">
          <div className="relative size-28">
            <Image src="/assets/avatars/avatar-2.svg" alt="" fill />
            <Image
              src="/assets/props/glasses/round-glasses.svg"
              alt=""
              width={44}
              height={30}
              className="absolute top-[36%] left-1/2 h-auto w-11 -translate-x-1/2"
            />
          </div>
        </div>

        <div className="w-28 shrink-0 border-l p-2">
          <p className="text-slate-400">Select a prop to see its properties.</p>
          <p className="mt-3 font-semibold text-slate-600">Animation</p>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {MOCK_ANIMATIONS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  'truncate rounded-md border px-1 py-1 text-center text-[10px]',
                  i === 0 ? 'bg-slate-900 text-white' : 'text-slate-500',
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
