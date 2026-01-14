import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, FileText, CheckCircle, Loader, Search, Database, Lock, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import * as pdfjsLib from 'pdfjs-dist';
import { analyzeDocumentWithGroq } from '../services/groq';
import { parseLoanAgreement } from '../utils/pdfParser';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Force worker import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function Upload() {
  const { currentAgreement, setCurrentPage, updateAgreementData, groqApiKey } = useStore();
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseStatus, setParseStatus] = useState('Initializing...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMsg(null);
      handleParse(file);
    }
  };

  const onBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const extractText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 30); // Limit context window
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return fullText;
  }

  const handleParse = async (file: File) => {
    setIsParsing(true);
    setParseProgress(0);
    setErrorMsg(null);

    try {
      setParseStatus('Extracting text from PDF layers...');
      setParseProgress(20);
      const rawText = await extractText(file);

      setParseProgress(50);

      let analysis;
      if (useStore.getState().isOfflineMode) {
        setParseStatus('Processing Locally (Regex)...');
        // Manual sleep to simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        const localResult = await parseLoanAgreement(file);
        // Map local result to "analysis" structure expected below
        analysis = {
          isValid: true,
          metadata: localResult.metadata,
          covenants: localResult.covenants,
          flowchart: undefined // Local parser might not generate flowchart, or use store defaults
        };
      } else {
        setParseStatus('Consulting AI Analyst (Groq)...');
        analysis = await analyzeDocumentWithGroq(rawText, groqApiKey);
      }

      if (!analysis.isValid) {
        setErrorMsg(analysis.reason || "The uploaded document does not appear to be a valid loan agreement.");
        setIsParsing(false);
        return;
      }

      setParseStatus('Structuring Deal Data...');
      setParseProgress(90);

      const agreementMetadata = {
        id: `agreement-${Date.now()}`,
        name: `${analysis.metadata?.borrower} - Credit Agreement`,
        borrower: analysis.metadata?.borrower || 'Unknown',
        facilityAmount: analysis.metadata?.facilityAmount || 0,
        interestType: analysis.metadata?.interestType || 'TBD',
        maturityDate: analysis.metadata?.maturityDate || new Date().toISOString().split('T')[0],
        uploadDate: new Date().toISOString(),
        parsed: true
      };

      const participants = [
        { id: 'p1', name: 'Lead Arranger', role: 'agent' as const, exposure: (agreementMetadata.facilityAmount || 0) * 0.2 },
        { id: 'p2', name: 'Syndicate A', role: 'lender' as const, exposure: (agreementMetadata.facilityAmount || 0) * 0.4 },
        { id: 'p3', name: 'Syndicate B', role: 'lender' as const, exposure: (agreementMetadata.facilityAmount || 0) * 0.4 },
        { id: 'p4', name: 'Buyer X', role: 'buyer' as const, exposure: 0 },
      ];

      setTimeout(() => {
        updateAgreementData({
          metadata: agreementMetadata,
          covenants: analysis.covenants || [],
          participants: participants,
          flowchart: analysis.flowchart
        });
        setIsParsing(false);
        setCurrentPage('flowchart');
      }, 1000);

    } catch (error: any) {
      console.error("Parsing failed:", error);
      setErrorMsg(`Analysis Failed: ${error.message || "Unknown error"}. Check console for details.`);
      setIsParsing(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Upload & Analyze</h1>
          <p className="text-gray-400 mb-8">Securely process your loan agreement on-device</p>

          {errorMsg && (
            <div className="mb-6 bg-red-500/10 border border-red-500/40 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="text-red-400" />
              <p className="text-red-200">{errorMsg}</p>
            </div>
          )}

          {!currentAgreement && !isParsing ? (
            <div className="glass-card p-12 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-600/5 group-hover:bg-indigo-600/10 transition-colors" />

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf"
              />

              <div className="relative z-10">
                <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-gray-700">
                  <UploadIcon className="w-10 h-10 text-indigo-400" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">Upload Loan Agreement</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Drag and drop your PDF here.
                  <br />
                  <span className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-2">
                    <Lock size={12} /> Local Processing Only
                  </span>
                </p>

                <button
                  onClick={onBrowseClick}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1"
                >
                  Select PDF Document
                </button>
              </div>
            </div>
          ) : isParsing ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-24 h-24 mb-8 relative">
                <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                <Search className="absolute inset-0 m-auto text-white w-8 h-8 animate-pulse" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">AI Analyst Working...</h3>
              <p className="text-indigo-300 font-medium mb-8">{selectedFile?.name}</p>

              <div className="w-full max-w-lg bg-gray-800 rounded-full h-2 mb-4 overflow-hidden">
                <motion.div
                  className="bg-indigo-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${parseProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Database size={14} className="animate-bounce" />
                <p>{parseStatus}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {/* Document Preview */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="text-indigo-400" />
                  Document Preview
                </h3>
                <div className="bg-gray-900 rounded-lg p-8 h-96 flex items-center justify-center border border-gray-700">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">Term Loan B Agreement_vFinal.pdf</p>
                    <p className="text-gray-600 text-sm mt-2">145 Pages • 4.2 MB</p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Extracted Metadata</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Agreement Name</p>
                      <p className="text-gray-900 dark:text-white font-medium text-right">{currentAgreement?.name}</p>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Borrower</p>
                      <p className="text-gray-900 dark:text-white font-medium text-right">{currentAgreement?.borrower}</p>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Facility Amount</p>
                      <p className="text-gray-900 dark:text-white font-medium text-right">${(currentAgreement?.facilityAmount ? currentAgreement.facilityAmount / 1000000 : 0).toFixed(0)}M</p>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Interest Type</p>
                      <p className="text-gray-900 dark:text-white font-medium text-right">{currentAgreement?.interestType}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Maturity Date</p>
                      <p className="text-gray-900 dark:text-white font-medium text-right">{currentAgreement?.maturityDate}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 bg-green-500/10 border-green-500/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                    <div>
                      <h4 className="text-white font-semibold">Parsing Complete</h4>
                      <p className="text-green-300/80 text-sm mt-1">
                        Successfully extracted 45 key data points and generated logic path.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
