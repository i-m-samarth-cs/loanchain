import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Search, FileText, Calendar, DollarSign } from 'lucide-react';
import { DealSheet } from '../types';

const { ipcRenderer } = window.require('electron');

export default function OfflineVault() {
  const [deals, setDeals] = useState<DealSheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUtils = async () => {
      try {
        const loadedDeals = await ipcRenderer.invoke('load-deals');
        setDeals(loadedDeals.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } catch (err) {
        console.error('Failed to load deals', err);
      } finally {
        setLoading(false);
      }
    };
    loadUtils();
  }, []);

  return (
    <div className="h-screen overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Offline Vault</h1>
              <p className="text-gray-400">Secure local storage • No cloud sync</p>
            </div>
            <div className="bg-gray-800 p-2 rounded-lg flex items-center gap-2 border border-gray-700">
              <Search size={20} className="text-gray-400 ml-2" />
              <input
                type="text"
                placeholder="Search past deals..."
                className="bg-transparent border-none text-white focus:outline-none w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : deals.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No deals saved yet</h3>
              <p className="text-gray-400">Complete a trade simulation and save it to see it here</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {deals.map((deal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center border border-indigo-500/30 group-hover:border-indigo-500/60 transition-colors">
                      <FileText className="text-indigo-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{deal.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(deal.timestamp).toLocaleDateString()}
                        </span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                        <span className="text-gray-300">{deal.trade.buyer.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-white font-bold text-xl flex items-center justify-end gap-1">
                      <DollarSign size={16} className="text-green-400" />
                      {((deal.trade.seller.exposure * deal.trade.percentage) / 100).toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">Par Amount</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
