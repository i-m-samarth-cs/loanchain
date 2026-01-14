import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Settings() {
  const { isDarkMode, toggleDarkMode, isOfflineMode, toggleOfflineMode, isAutoSave, toggleAutoSave } = useStore();

  return (
    <div className="h-screen overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Configure your LoanChain experience</p>

          <div className="space-y-4">
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold mb-1">Dark Mode</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Toggle between light and dark themes</p>
              </div>
              <button
                onClick={toggleDarkMode}
                className="w-14 h-14 bg-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors"
              >
                {isDarkMode ? <Moon className="text-white" /> : <Sun className="text-white" />}
              </button>
            </div>

            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold mb-1">Offline Mode</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Force local processing (Regex) instead of Cloud AI</p>
              </div>
              <button
                onClick={toggleOfflineMode}
                className={`w-12 h-6 rounded-full relative transition-colors ${isOfflineMode ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
              >
                <motion.div
                  initial={false}
                  animate={{ x: isOfflineMode ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                />
              </button>
            </div>

            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold mb-1">Auto-save Deals</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Automatically save completed trades to vault</p>
              </div>
              <button
                onClick={toggleAutoSave}
                className={`w-12 h-6 rounded-full relative transition-colors ${isAutoSave ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}
              >
                <motion.div
                  initial={false}
                  animate={{ x: isAutoSave ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
