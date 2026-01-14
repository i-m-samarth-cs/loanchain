import React from 'react';
import { motion } from 'framer-motion';
import { Upload, PlayCircle, CheckCircle, Zap, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { useStore } from '../store/useStore';
import StatCard from '../components/StatCard';
import FloatingCard from '../components/FloatingCard';

export default function Hero() {
  const { setCurrentPage, loadDemoData } = useStore();

  const handleLoadDemo = () => {
    loadDemoData();
    setCurrentPage('upload');
  };

  return (
    <div className="h-screen overflow-y-auto scrollbar-hide">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center px-8 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 bg-indigo-600/20 rounded-full border border-indigo-500/30 mb-6"
            >
              <span className="text-indigo-300 text-sm font-medium">🔒 Offline-First • Enterprise Grade</span>
            </motion.div>

            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              LoanChain Desktop
              <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Visual Loan Trading, Instantly.
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Upload a loan agreement → auto-generate cashflow flowcharts → simulate trades → export deal sheets in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 mb-8">
              <motion.button
                onClick={() => setCurrentPage('upload')}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition-all flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload size={20} />
                Upload Loan Agreement
              </motion.button>

              <motion.button
                onClick={handleLoadDemo}
                className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20 flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlayCircle size={20} />
                Try Demo File
              </motion.button>
            </div>

            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle size={16} />
              <span className="font-medium">Offline Mode Enabled — All processing happens locally</span>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 space-y-6">
              <FloatingCard title="Covenant Triggered" value="DSCR < 1.25" delay={0.3} color="#ef4444" />
              <FloatingCard title="Risk Transfer" value="65%" delay={0.6} color="#3b82f6" />
              <FloatingCard title="New Price" value="98.25" delay={0.9} color="#22c55e" />
            </div>

            {/* Gradient Orb */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 blur-3xl rounded-full" />
          </motion.div>
        </div>

        {/* Animated Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute bottom-12 left-8 right-8"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4">
            <StatCard icon={Zap} label="Parsing Time" value="< 2s" delay={0.1} />
            <StatCard icon={Clock} label="Deal Closure" value="Minutes" trend="vs. Days" delay={0.2} />
            <StatCard icon={TrendingUp} label="Syndicated Market" value="$7T+" delay={0.3} />
            <StatCard icon={DollarSign} label="Exported Sheets" value="1-click" delay={0.4} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
