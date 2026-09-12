export interface AvatarGenerationInput {
  /** Raw photo bytes — generation runs server-side only, never in the browser. */
  photo: { buffer: Buffer; mimeType: string };
  style?: string;
}

export interface GeneratedAvatar {
  id: string;
  url: string;
  width: number;
  height: number;
}

export interface ExpressionGenerationInput {
  /** The project's neutral base avatar image to edit — always the original,
   * never a previously-generated expression, so expressions don't chain off
   * each other and compound drift/artifacts. */
  avatarUrl: string;
  expressionPrompt: string;
}

export interface GeneratedExpression {
  url: string;
}
