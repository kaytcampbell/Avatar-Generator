export interface ExpressionOption {
  id: string;
  label: string;
  emoji: string;
  /** Fed into the image-edit prompt server-side — kept out of client control
   * (the client only ever sends an id) so requests can't inject arbitrary
   * prompt text. */
  prompt: string;
}

export const EXPRESSIONS: ExpressionOption[] = [
  { id: 'happy', label: 'Happy', emoji: '😊', prompt: 'a big warm smiling happy expression' },
  { id: 'sad', label: 'Sad', emoji: '😢', prompt: 'a sad expression with a downturned mouth and teary eyes' },
  { id: 'angry', label: 'Angry', emoji: '😠', prompt: 'an angry expression with a furrowed brow and a frown' },
  {
    id: 'surprised',
    label: 'Surprised',
    emoji: '😲',
    prompt: 'a surprised expression with wide eyes and an open mouth',
  },
  {
    id: 'laughing',
    label: 'Laughing',
    emoji: '😆',
    prompt: 'a laughing expression with closed eyes and a big open-mouthed grin',
  },
  {
    id: 'wink',
    label: 'Winking',
    emoji: '😉',
    prompt: 'a playful winking expression with one eye closed and a smile',
  },
];

export function getExpressionById(id: string): ExpressionOption | undefined {
  return EXPRESSIONS.find((expression) => expression.id === id);
}
