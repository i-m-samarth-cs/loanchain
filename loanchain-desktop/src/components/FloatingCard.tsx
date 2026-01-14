import React from 'react';
import { motion } from 'framer-motion';

interface FloatingCardProps {
  title: string;
  value: string;
  delay: number;
  color: string;
}

export default function FloatingCard({ title, value, delay, color }: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, repeat: Infinity, repeatType: 'reverse', repeatDelay: 2 }}
      className="glass-card p-4 min-w-[200px]"
      style={{ boxShadow: `0 0 20px ${color}40` }}
    >
      <p className="text-gray-400 text-xs mb-1">{title}</p>
      <p className={`font-bold text-lg`} style={{ color }}>{value}</p>
    </motion.div>
  );
}
