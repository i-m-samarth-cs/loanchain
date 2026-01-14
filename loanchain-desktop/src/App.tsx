import React from 'react';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import Hero from './pages/Hero';
import Upload from './pages/Upload';
import Flowchart from './pages/Flowchart';
import TradeSimulator from './pages/TradeSimulator';
import DealSheet from './pages/DealSheet';
import OfflineVault from './pages/OfflineVault';
import Settings from './pages/Settings';

const { ipcRenderer } = window.require('electron');

function App() {
  const { currentPage, isDarkMode, isAutoSave, currentAgreement, trades, covenants } = useStore();

  // Dark Mode Effect
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-save Effect
  React.useEffect(() => {
    if (!isAutoSave || !currentAgreement) return;

    const saveData = async () => {
      const dealData = {
        metadata: currentAgreement,
        covenants,
        trades,
        lastSaved: new Date().toISOString()
      };
      try {
        await ipcRenderer.invoke('save-deal', dealData);
        console.log('Auto-saved deal');
      } catch (err) {
        console.error('Auto-save failed', err);
      }
    };

    const timeoutId = setTimeout(saveData, 3000); // Debounce 3s
    return () => clearTimeout(timeoutId);
  }, [currentAgreement, trades, covenants, isAutoSave]);

  const renderPage = () => {
    switch (currentPage) {
      case 'hero': return <Hero />;
      case 'upload': return <Upload />;
      case 'flowchart': return <Flowchart />;
      case 'trade': return <TradeSimulator />;
      case 'dealsheet': return <DealSheet />;
      case 'vault': return <OfflineVault />;
      case 'settings': return <Settings />;
      default: return <Hero />;
    }
  };

  return (
    <div className={`flex gradient-bg ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar />
      <main className="flex-1">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
