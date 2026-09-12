'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useExpressionGeneration } from '@/hooks/useExpressionGeneration';
import { EXPRESSIONS } from '@/lib/expressions';
import type { AvatarExpressionState } from '@/types/avatar-project';

interface ExpressionPanelProps {
  baseAvatarUrl: string;
  expression: AvatarExpressionState;
  onSetExpression: (expressionId: string | null) => void;
  onAddExpressionVariant: (expressionId: string, url: string) => void;
}

export function ExpressionPanel({
  baseAvatarUrl,
  expression,
  onSetExpression,
  onAddExpressionVariant,
}: ExpressionPanelProps) {
  const { status, error, generate } = useExpressionGeneration();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleSelect(expressionId: string | null) {
    if (expressionId === null) {
      onSetExpression(null);
      return;
    }
    // Already generated once — switch instantly, no API call.
    if (expression.variants[expressionId]) {
      onSetExpression(expressionId);
      return;
    }
    setPendingId(expressionId);
    const result = await generate(baseAvatarUrl, expressionId);
    setPendingId(null);
    if (result) onAddExpressionVariant(expressionId, result.url);
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <span className="font-heading text-xs font-bold text-foreground">Expression</span>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={expression.activeId === null ? 'default' : 'outline'}
          size="sm"
          aria-pressed={expression.activeId === null}
          onClick={() => handleSelect(null)}
        >
          Neutral
        </Button>
        {EXPRESSIONS.map((option) => {
          const isActive = expression.activeId === option.id;
          const isPending = status === 'generating' && pendingId === option.id;
          return (
            <Button
              key={option.id}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              aria-pressed={isActive}
              disabled={isPending}
              onClick={() => handleSelect(option.id)}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <span aria-hidden="true">{option.emoji}</span>
              )}
              {option.label}
            </Button>
          );
        })}
      </div>
      {status === 'error' && error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
