import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function TradeSimulator() {
  const { participants, setCurrentPage, addTrade } = useStore();
  const [tradePercentage, setTradePercentage] = useState(50);
  const [tradePrice, setTradePrice] = useState(98.5);

  const lenders = participants.filter(p => p.role === 'lender');
  const buyers = participants.filter(p => p.role === 'buyer');

  const handleSimulateTrade = () => {
    if (lenders[0] && buyers[0]) {
      addTrade({
        id: `trade-${Date.now()}`,
        seller: lenders[0],
        buyer: buyers[0],
        percentage: tradePercentage,
        price: tradePrice,
        timestamp: new Date().toISOString(),
      });
      setCurrentPage('dealsheet');
    }
  };

  return (
    <div className="h-screen overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Trade Simulator</h1>
          <p className="text-gray-400 mb-8">Simulate loan portfolio transfers with drag-and-drop</p>

          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Current Lenders */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="text-blue-400" />
                Current Lenders
              </h3>
              <div className="space-y-3">
                {lenders.map(lender => (
                  <div key={lender.id} className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-white font-medium">{lender.name}</p>
                    <p className="text-blue-300 text-sm">${(lender.exposure / 1000000).toFixed(0)}M exposure</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trade Configuration */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="text-purple-400" />
                Trade Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Transfer Percentage</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={tradePercentage}
                    onChange={(e) => setTradePercentage(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-white font-bold text-2xl mt-2">{tradePercentage}%</p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Price</label>
                  <input
                    type="number"
                    value={tradePrice}
                    onChange={(e) => setTradePrice(Number(e.target.value))}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
                    step="0.1"
                  />
                </div>

                <button
                  onClick={handleSimulateTrade}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                >
                  Simulate Trade
                </button>
              </div>
            </div>

            {/* Potential Buyers */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="text-green-400" />
                Potential Buyers
              </h3>
              <div className="space-y-3">
                {buyers.map(buyer => (
                  <div key={buyer.id} className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
                    <p className="text-white font-medium">{buyer.name}</p>
                    <p className="text-green-300 text-sm">Available</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Transfer Visualization */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Transfer Impact</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Before</p>
                <div className="h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-medium">
                  100%
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Transfer</p>
                <div className="h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-medium">
                  {tradePercentage}%
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">After</p>
                <div className="h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-medium">
                  {100 - tradePercentage}%
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
