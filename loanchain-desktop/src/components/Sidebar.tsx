import React from 'react';
import { motion } from 'framer-motion';
import { Home, Upload, Network, TrendingUp, FileText, Database, Settings, X, Minus, Square } from 'lucide-react';
import { useStore } from '../store/useStore';

const { ipcRenderer } = window.require('electron');

const menuItems = [
  { id: 'hero', label: 'Dashboard', icon: Home },
  { id: 'upload', label: 'Upload & Parse', icon: Upload },
  { id: 'flowchart', label: 'Visual Flowchart', icon: Network },
  { id: 'trade', label: 'Trade Simulator', icon: TrendingUp },
  { id: 'dealsheet', label: 'Deal Sheet', icon: FileText },
  { id: 'vault', label: 'Offline Vault', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { currentPage, setCurrentPage } = useStore();

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black border-r border-gray-800 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Title Bar Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 drag-region">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 cursor-pointer" onClick={() => ipcRenderer.send('window-close')} />
          <div className="w-2 h-2 rounded-full bg-yellow-500 cursor-pointer" onClick={() => ipcRenderer.send('window-minimize')} />
          <div className="w-2 h-2 rounded-full bg-green-500 cursor-pointer" onClick={() => ipcRenderer.send('window-maximize')} />
        </div>
      </div>

      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">LoanChain</h1>
              <p className="text-gray-400 text-xs">Desktop</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={20} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </motion.button>
          );
        })}
      </nav>

      {/* Offline Badge */}
      <div className="p-4 border-t border-gray-800">
        {!collapsed && (
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-medium">Offline Mode Active</span>
            </div>
            <p className="text-gray-500 text-xs mt-1">No data leaves device</p>
          </div>
        )}
      </div>
    </div>
  );
}
