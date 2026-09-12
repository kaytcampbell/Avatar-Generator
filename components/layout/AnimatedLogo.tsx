'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function AnimatedLogo() {
  return (
    <motion.div
      whileHover={{ rotate: [-2, 2, -1, 0], scale: 1.04 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="inline-block"
    >
      <Link href="/" className="font-heading text-xl whitespace-nowrap">
        <span className="bg-gradient-to-r from-sky-500 to-purple-600 bg-clip-text text-transparent">DD</span>{' '}
        <span className="text-slate-800">Avatar Studio</span>
      </Link>
    </motion.div>
  );
}
