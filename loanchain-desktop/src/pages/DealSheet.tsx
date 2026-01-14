import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Save, Check, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

const { ipcRenderer } = window.require('electron');

export default function DealSheet() {
  const { trades, currentAgreement, addDealSheet } = useStore();
  const lastTrade = trades[trades.length - 1];
  const sheetRef = useRef<HTMLDivElement>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExportPNG = async () => {
    if (sheetRef.current) {
      try {
        const dataUrl = await toPng(sheetRef.current, { cacheBust: true });
        const link = document.createElement('a');
        link.download = `deal-sheet-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to export PNG', err);
      }
    }
  };

  const handleExportPDF = async () => {
    if (sheetRef.current) {
      try {
        const dataUrl = await toPng(sheetRef.current, { cacheBust: true });
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`deal-sheet-${Date.now()}.pdf`);
      } catch (err) {
        console.error('Failed to export PDF', err);
      }
    }
  };

  const handleSaveToVault = async () => {
    if (!lastTrade || !currentAgreement) return;

    try {
      const dealData = {
        id: `deal-${Date.now()}`,
        title: `${currentAgreement.name} - Trade ${lastTrade.id.slice(-4)}`,
        trade: lastTrade,
        agreement: currentAgreement,
        timestamp: new Date().toISOString()
      };

      const result = await ipcRenderer.invoke('save-deal', dealData);

      if (result.success) {
        addDealSheet(dealData);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Failed to save to vault:', error);
      setSaveStatus('error');
    }
  };

  return (
    <div className="h-screen overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Deal Sheet</h1>
          <p className="text-gray-400 mb-8">Export your trade summary and documentation</p>

          {lastTrade && currentAgreement ? (
            <>
              {/* Content to capture */}
              <div ref={sheetRef} className="glass-card p-10 mb-8 bg-[#0a0a0f] border border-gray-800">
                <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Trade Confirmation</h2>
                    <p className="text-indigo-400 font-medium mt-1">LoanChain Digital Settlement</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Date Executed</p>
                    <p className="text-white font-mono">{new Date().toLocaleDateString()}</p>
                    <p className="text-gray-500 text-xs mt-1">ID: {lastTrade.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-8 mb-8">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Seller</p>
                    <p className="text-white font-semibold text-xl">{lastTrade.seller.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Buyer</p>
                    <p className="text-white font-semibold text-xl">{lastTrade.buyer.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Par Amount Transferred</p>
                    <p className="text-white font-semibold text-xl">
                      ${((lastTrade.seller.exposure * lastTrade.percentage) / 100).toLocaleString()}
                      <span className="text-gray-500 text-sm font-normal ml-2">({lastTrade.percentage}%)</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Purchase Price</p>
                    <p className="text-white font-semibold text-xl">{lastTrade.price}%</p>
                  </div>
                  <div className="col-span-2 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Underlying Asset</p>
                    <p className="text-white font-medium text-lg">{currentAgreement.name}</p>
                    <p className="text-gray-400 text-sm mt-1">{currentAgreement.borrower}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-600 pt-6 border-t border-gray-800">
                  <p>Generated via LoanChain Desktop</p>
                  <p>Verified Information • Immutable Record</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleExportPDF}
                  className="flex-1 px-6 py-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 flex items-center justify-center gap-2 transition-all border border-gray-700"
                >
                  <Download size={20} className="text-red-400" />
                  Export PDF
                </button>
                <button
                  onClick={handleExportPNG}
                  className="flex-1 px-6 py-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 flex items-center justify-center gap-2 transition-all border border-gray-700"
                >
                  <Download size={20} className="text-purple-400" />
                  Export PNG
                </button>
                <button
                  onClick={handleSaveToVault}
                  disabled={saveStatus === 'success'}
                  className={`flex-1 px-6 py-4 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${saveStatus === 'success'
                      ? 'bg-green-600/20 text-green-400 border border-green-500/50 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20'
                    }`}
                >
                  {saveStatus === 'success' ? (
                    <>
                      <Check size={20} />
                      Saved to Vault
                    </>
                  ) : saveStatus === 'error' ? (
                    <>
                      <AlertCircle size={20} />
                      Error Saving
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save to Vault
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="glass-card p-12 text-center text-gray-400">
              <p>No active trade to export. Please simulate a trade first.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
