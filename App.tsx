import React, { useState, useEffect, useRef } from 'react';
import { ScanVisualizer } from './components/ScanVisualizer';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { CyberButton } from './components/CyberButton';
import { ScriptModal } from './components/ScriptModal';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './contexts/ThemeContext';
import { AppTab, PortResult } from './types';
import { Terminal, Shield, Radio, LayoutDashboard, AlertCircle, Code } from 'lucide-react';
import { generateSimulationData } from './services/geminiService';
import { PYTHON_SCANNER_SCRIPT } from './utils/pythonScript';

export default function App() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SIMULATOR);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<PortResult[]>([]);
  const [generatedLog, setGeneratedLog] = useState<string | null>(null);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);

  // Ref to hold the interval ID for cleanup
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Apply theme class to body when theme changes
  useEffect(() => {
    if (theme === 'high-contrast') {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [theme]);

  // Cleanup scan interval on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  // Simulates the Port Scanner Logic (Since browsers can't really scan ports)
  const handleStartSimulation = async () => {
    // Clear any existing interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    setIsScanning(true);
    setScanResults([]);
    setGeneratedLog(null);

    // Mock finding ports sequentially
    const mockPorts: PortResult[] = [
        { port: 21, service: 'FTP', state: 'open' },
        { port: 22, service: 'SSH', state: 'open' },
        { port: 80, service: 'HTTP', state: 'open' },
        { port: 3389, service: 'RDP', state: 'open' }, // The vulnerability
    ];

    let foundCount = 0;
    
    scanIntervalRef.current = setInterval(() => {
        if (foundCount < mockPorts.length) {
            setScanResults(prev => [...prev, mockPorts[foundCount]]);
            foundCount++;
        } else {
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
            }
            finishSimulation();
        }
    }, 1200);
  };

  const finishSimulation = async () => {
    setIsScanning(false);
    // Generate a fun log for the user to copy
    const log = await generateSimulationData();
    setGeneratedLog(log);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${theme === 'high-contrast' ? 'bg-black text-white' : 'bg-[#050505] text-zinc-300 selection:bg-cyan-900 selection:text-white'}`}>
      
      <ScriptModal 
        isOpen={isScriptModalOpen} 
        onClose={() => setIsScriptModalOpen(false)} 
        code={PYTHON_SCANNER_SCRIPT} 
      />

      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-900/20 border border-cyan-500 rounded flex items-center justify-center text-cyan-400">
              <Terminal size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">NETSEC<span className="text-cyan-500">.AI</span></h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Security Operations Center</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-2">
              {[
                  { id: AppTab.SIMULATOR, label: 'SCAN SIMULATOR', icon: <Radio size={16}/> },
                  { id: AppTab.ANALYZER, label: 'LOG ANALYZER', icon: <Shield size={16}/> },
              ].map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-xs font-mono font-bold flex items-center gap-2 rounded transition-colors ${
                          activeTab === tab.id 
                          ? 'bg-zinc-800 text-cyan-400 border-b-2 border-cyan-500' 
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                      }`}
                  >
                      {tab.icon}
                      {tab.label}
                  </button>
              ))}
            </nav>
            <div className="h-6 w-px bg-zinc-800"></div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        
        {/* Tab: Simulator */}
        {activeTab === AppTab.SIMULATOR && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl text-white font-bold mb-2 flex items-center gap-3">
                            <LayoutDashboard className="text-cyan-500" /> Target Reconnaissance
                        </h2>
                        <p className="text-zinc-400 mb-3">
                            Run a simulated port scan on target infrastructure. 
                        </p>
                        <div className="bg-yellow-900/10 border border-yellow-900/50 rounded p-3 flex flex-col gap-2">
                            <p className="text-yellow-600 text-xs font-mono flex items-start gap-2">
                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                <span>
                                    BROWSER RESTRICTION: Real raw socket scanning is not possible directly from the browser. This tool visualizes the process.
                                    For real engagements, use the Python tool provided.
                                </span>
                            </p>
                            <button 
                                onClick={() => setIsScriptModalOpen(true)}
                                className="self-start text-xs font-bold text-yellow-500 hover:text-yellow-400 flex items-center gap-1 transition-colors"
                            >
                                <Code size={12} /> GET PYTHON SCANNER SCRIPT
                            </button>
                        </div>
                    </div>
                    <CyberButton 
                        onClick={handleStartSimulation} 
                        disabled={isScanning}
                        className="w-48"
                    >
                        {isScanning ? 'SCANNING...' : 'START SIMULATION'}
                    </CyberButton>
                </div>

                <ScanVisualizer isScanning={isScanning} results={scanResults} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {scanResults.map((result) => (
                        <div key={result.port} className="bg-zinc-900/40 border border-red-900/30 p-4 rounded hover:border-red-500/50 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-red-400 font-mono text-xl font-bold">:{result.port}</span>
                                <span className="px-2 py-0.5 bg-red-900/30 text-red-400 text-[10px] uppercase rounded border border-red-900/50">OPEN</span>
                            </div>
                            <div className="text-zinc-300 font-mono text-sm">{result.service} Service</div>
                            <div className="text-zinc-600 text-xs mt-2 group-hover:text-zinc-400">Potential entry vector detected.</div>
                        </div>
                    ))}
                </div>

                {generatedLog && (
                    <div className="bg-zinc-950 border border-zinc-800 p-6 rounded relative animate-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-cyan-500 font-mono text-sm">>> SIMULATION_OUTPUT.LOG</h3>
                            <span className="text-xs text-zinc-600 font-mono">Generated via Gemini 2.5 Flash</span>
                        </div>
                        <pre className="font-mono text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
                            {generatedLog}
                        </pre>
                        <div className="mt-4 flex justify-end">
                             <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedLog);
                                    setActiveTab(AppTab.ANALYZER);
                                }}
                                className="text-xs text-white bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded font-bold transition-colors shadow-[0_0_15px_rgba(8,145,178,0.4)]"
                             >
                                COPY TO ANALYZER
                             </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Tab: Analyzer */}
        {activeTab === AppTab.ANALYZER && (
            <div className="h-[calc(100vh-10rem)] animate-in slide-in-from-bottom-4 duration-500">
                <AnalysisDashboard />
            </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 mt-auto bg-black transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-xs text-zinc-600 font-mono">
            <div>
                SYSTEM_STATUS: <span className="text-green-500">ONLINE</span>
            </div>
            <div>
                POWERED BY GEMINI 2.5 FLASH
            </div>
        </div>
      </footer>
    </div>
  );
}