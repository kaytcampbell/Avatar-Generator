import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { SaveStatus } from '@/hooks/useAvatarProject';

const LABELS: Record<SaveStatus, string> = {
  idle: 'Not saved yet',
  saving: 'Saving...',
  saved: 'Saved',
  error: 'Save failed',
};

const VARIANTS: Record<SaveStatus, 'secondary' | 'default' | 'destructive'> = {
  idle: 'secondary',
  saving: 'secondary',
  saved: 'default',
  error: 'destructive',
};

export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  return (
    // Keyed on status so each transition (idle -> saving -> saved) remounts
    // this and replays a fresh little pop, rather than animating just once.
    <motion.div
      key={status}
      initial={{ scale: 0.7, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      className="inline-flex"
    >
      <Badge variant={VARIANTS[status]} role="status">
        {LABELS[status]}
      </Badge>
    </motion.div>
  );
}
