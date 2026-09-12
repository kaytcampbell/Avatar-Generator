'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhotoUploader } from '@/components/create/PhotoUploader';
import { GeneratedAvatarGrid } from '@/components/create/GeneratedAvatarGrid';
import { StylizedAvatarUpload } from '@/components/create/StylizedAvatarUpload';
import { useAvatarGeneration } from '@/hooks/useAvatarGeneration';
import { validatePhotoFile } from '@/lib/validate-photo';
import { getProjectStore } from '@/lib/storage';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_CANVAS_SETTINGS } from '@/lib/constants';
import { createDefaultAvatarLayer } from '@/lib/avatar-layers';
import type { GeneratedAvatar } from '@/types/generation';
import type { AvatarProject } from '@/types/avatar-project';

const PENDING_AVATAR_KEY = 'dd-avatar-gen:pending-avatar';

type Mode = 'generate' | 'upload';

export default function CreatePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('generate');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<GeneratedAvatar | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  const { status, results, error, generate, reset } = useAvatarGeneration();

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  // Resolves auth once for both concerns: gating the whole flow upfront (a
  // signed-out user shouldn't even see the upload UI, since generate/upload
  // now require auth server-side) and resuming a pending selection if they
  // just came back from signing in mid-flow.
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const authed = !!data.user;
        setIsAuthenticated(authed);
        setAuthChecked(true);

        const pending = window.sessionStorage.getItem(PENDING_AVATAR_KEY);
        if (pending) {
          if (authed) {
            setSelectedAvatar(JSON.parse(pending) as GeneratedAvatar);
            setResumed(true);
          }
          window.sessionStorage.removeItem(PENDING_AVATAR_KEY);
        }
      });
  }, []);

  function handleFileSelected(file: File) {
    const validationError = validatePhotoFile(file);
    if (validationError) {
      setPhotoError(validationError);
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhotoError(null);
    setSelectedAvatar(null);
    setNeedsAuth(false);
    reset();
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleRemove() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPhotoFile(null);
    setPhotoError(null);
    setSelectedAvatar(null);
    reset();
  }

  function handleModeChange(nextMode: Mode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    handleRemove();
    setNeedsAuth(false);
  }

  async function handleGenerate() {
    if (!photoFile) return;
    setSelectedAvatar(null);
    setNeedsAuth(false);
    await generate(photoFile);
  }

  async function handleContinue() {
    if (!selectedAvatar) return;
    setIsCreatingProject(true);

    const { data } = await createClient().auth.getUser();
    if (!data.user) {
      window.sessionStorage.setItem(PENDING_AVATAR_KEY, JSON.stringify(selectedAvatar));
      setNeedsAuth(true);
      setIsCreatingProject(false);
      return;
    }

    const now = new Date().toISOString();
    const project: AvatarProject = {
      id: crypto.randomUUID(),
      userId: data.user.id,
      name: 'Untitled Avatar',
      baseAvatarUrl: selectedAvatar.url,
      layers: [createDefaultAvatarLayer()],
      animation: null,
      expression: { activeId: null, variants: {} },
      canvasSettings: { ...DEFAULT_CANVAS_SETTINGS },
      createdAt: now,
      updatedAt: now,
    };
    await getProjectStore().createProject(project);
    router.push(`/editor/${project.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Create your avatar</h1>
        <p className="text-muted-foreground">
          Upload a photo and generate a few stylized options, or upload an avatar you&rsquo;ve already made.
        </p>
      </div>

      {!authChecked ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : !isAuthenticated ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-16 text-center">
          <p className="text-muted-foreground">Sign in to create your avatar.</p>
          <Button asChild>
            <Link href="/login?redirectTo=/create">Sign in</Link>
          </Button>
        </div>
      ) : (
        <>
          {resumed && selectedAvatar && (
            <div className="flex items-center gap-4 rounded-xl border p-4">
              <Image
                src={selectedAvatar.url}
                alt="Your selected avatar"
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg border object-contain"
              />
              <p className="text-sm text-muted-foreground">
                Welcome back — continue with your selected avatar below.
              </p>
            </div>
          )}

          {!resumed && (
            <Tabs value={mode} onValueChange={(value) => handleModeChange(value as Mode)}>
              <TabsList>
                <TabsTrigger value="generate">Generate with AI</TabsTrigger>
                <TabsTrigger value="upload">Upload finished avatar</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {!resumed && mode === 'generate' && (
            <>
              <PhotoUploader
                previewUrl={previewUrl}
                error={photoError}
                onFileSelected={handleFileSelected}
                onRemove={handleRemove}
              />

              {previewUrl && (
                <Button onClick={handleGenerate} disabled={status === 'generating'} className="w-fit">
                  {status === 'generating' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  {status === 'generating' ? 'Generating...' : 'Generate Avatar'}
                </Button>
              )}

              {status === 'error' && error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <GeneratedAvatarGrid
                status={status}
                avatars={results}
                selectedId={selectedAvatar?.id ?? null}
                onSelect={setSelectedAvatar}
              />
            </>
          )}

          {!resumed && mode === 'upload' && <StylizedAvatarUpload onUploaded={setSelectedAvatar} />}

          {needsAuth && (
            <Alert>
              <AlertDescription>
                Sign in to save your avatar.{' '}
                <a href="/login?redirectTo=/create" className="font-medium underline">
                  Sign in
                </a>
              </AlertDescription>
            </Alert>
          )}

          {selectedAvatar && (
            <Button onClick={handleContinue} disabled={isCreatingProject} size="lg" className="w-fit">
              {isCreatingProject ? 'Creating project...' : 'Continue to Editor'}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
