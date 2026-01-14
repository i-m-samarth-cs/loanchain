import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  delay?: number;
}

export default function StatCard({ icon: Icon, label, value, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm mb-2">{label}</p>
          <h3 className="text-white text-3xl font-bold mb-1">{value}</h3>
          {trend && (
            <p className="text-green-400 text-sm font-medium">{trend}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center">
          <Icon className="text-indigo-400" size={24} />
        </div>
      </div>
    </motion.div>
  );
}
