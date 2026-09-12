import Link from 'next/link';
import { Upload, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorPreviewMock } from '@/components/home/EditorPreviewMock';
import { RobotFooter } from '@/components/home/RobotFooter';

const FEATURES = [
  {
    icon: Upload,
    gradient: 'from-violet-500 to-purple-600',
    text: 'Upload a photo for AI to stylize, or upload an existing avatar.',
  },
  {
    icon: SlidersHorizontal,
    gradient: 'from-sky-400 to-blue-600',
    text: 'Choose from a library of props, or generate your own to customize your avatar.',
  },
  {
    icon: Sparkles,
    gradient: 'from-emerald-400 to-teal-500',
    text: 'Add and customize animations, then export as an animated .gif.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <div
        className="flex flex-1 items-center bg-cover bg-center bg-no-repeat px-6 py-20"
        style={{ backgroundImage: "url('/backgrounds/hero-gradient.png')" }}
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <h1 className="text-4xl text-slate-800 sm:text-5xl">Create your own Dura Digital branded avatars.</h1>
            <ul className="flex flex-col gap-6">
              {FEATURES.map(({ icon: Icon, gradient, text }) => (
                <li key={text} className="flex items-start gap-4">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="pt-2 text-slate-600">{text}</p>
                </li>
              ))}
            </ul>
            <Button
              asChild
              size="lg"
              className="w-fit rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700"
            >
              <Link href="/create">Start Creating</Link>
            </Button>
          </div>
          <div className="hidden justify-self-center lg:flex">
            <EditorPreviewMock />
          </div>
        </div>
      </div>
      <RobotFooter />
    </div>
  );
}
