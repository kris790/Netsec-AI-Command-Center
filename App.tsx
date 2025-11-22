
import React, { useState, useEffect, useRef } from 'react';
import { ScanVisualizer } from './components/ScanVisualizer';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { CyberButton } from './components/CyberButton';
import { ScriptModal } from './components/ScriptModal';
import { ThemeToggle } from './components/ThemeToggle';
import { ScanConfigPanel } from './components/ScanConfigPanel';
import { useTheme } from './contexts/ThemeContext';
import { AppTab, PortResult, ScanConfig, ScanHistoryItem } from './types';
import { Terminal, Shield, Radio, LayoutDashboard, AlertCircle, Code, Clock, ChevronRight, Play, Trash2 } from 'lucide-react';
import { generateSimulationData } from './services/geminiService';
import { PYTHON_SCANNER_SCRIPT } from './utils/pythonScript';

export default function App() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SIMULATOR);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<PortResult[]>([]);
  const [generatedLog, setGeneratedLog] = useState<string | null>(null);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  
  // Version 2 State
  const [scanConfig, setScanConfig] = useState<ScanConfig>({ targetIp: '192.168.1.100', profile: 'stealth' });
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Apply theme
  useEffect(() => {
    if (theme === 'high-contrast') {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [theme]);

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  const handleStartSimulation = async () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    setIsScanning(true);
    setScanResults([]);
    setGeneratedLog(null);

    // Dynamic mock ports based on profile
    let basePorts: PortResult[] = [
        { port: 80, service: 'HTTP', state: 'open' },
        { port: 443, service: 'HTTPS', state: 'open' },
    ];

    if (scanConfig.profile === 'aggressive' || scanConfig.profile === 'full') {
        basePorts.push(
            { port: 21, service: 'FTP', state: 'open' },
            { port: 23, service: 'Telnet', state: 'open' }, // Risky!
            { port: 3389, service: 'RDP', state: 'open' },
            { port: 8080, service: 'HTTP-Proxy', state: 'open' }
        );
    } else {
        // Stealth
        basePorts.push({ port: 22, service: 'SSH', state: 'open' });
    }

    const speed = scanConfig.profile === 'aggressive' ? 300 : 800;
    let foundCount = 0;
    
    scanIntervalRef.current = setInterval(() => {
        if (foundCount < basePorts.length) {
            setScanResults(prev => [...prev, basePorts[foundCount]]);
            foundCount++;
        } else {
            if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
            finishSimulation(basePorts.length);
        }
    }, speed);
  };

  const finishSimulation = async (portCount: number) => {
    setIsScanning(false);
    
    // Generate log
    const log = await generateSimulationData(scanConfig.targetIp, scanConfig.profile);
    setGeneratedLog(log);

    // Add to History
    const newHistoryItem: ScanHistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        config: { ...scanConfig },
        portCount: portCount
    };
    setHistory(prev => [newHistoryItem, ...prev]);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col overflow-hidden ${theme === 'high-contrast' ? 'bg-black text-white' : 'bg-[#050505] text-zinc-300 selection:bg-cyan-900 selection:text-white'}`}>
      
      <ScriptModal 
        isOpen={isScriptModalOpen} 
        onClose={() => setIsScriptModalOpen(false)} 
        code={PYTHON_SCANNER_SCRIPT} 
      />

      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-900/20 border border-cyan-500 rounded flex items-center justify-center text-cyan-400 relative overflow-hidden">
              <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
              <Terminal size={20} className="relative z-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                NETSEC<span className="text-cyan-500">.AI</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded ml-2">v2.0</span>
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Security Operations Center</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-2">
              {[
                  { id: AppTab.SIMULATOR, label: 'OPS_CENTER', icon: <Radio size={16}/> },
                  { id: AppTab.ANALYZER, label: 'INTEL_ANALYSIS', icon: <Shield size={16}/> },
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
            <div className="h-6 w-px bg-zinc-800 hidden md:block"></div>
            <ThemeToggle />
            <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded border transition-colors ${showHistory ? 'bg-zinc-800 border-cyan-500 text-cyan-400' : 'border-zinc-800 text-zinc-500 hover:text-white'}`}
            >
                <Clock size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {activeTab === AppTab.SIMULATOR && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 space-y-6">
                            <div>
                                <h2 className="text-2xl text-white font-bold mb-2 flex items-center gap-3">
                                    <LayoutDashboard className="text-cyan-500" /> ACTIVE_SCANNER
                                </h2>
                                <p className="text-zinc-400 mb-4">
                                    Configure target parameters and initiate network reconnaissance.
                                </p>
                                
                                <ScanConfigPanel 
                                    config={scanConfig} 
                                    setConfig={setScanConfig} 
                                    disabled={isScanning}
                                />

                                <div className="flex items-center gap-4">
                                    <CyberButton 
                                        onClick={handleStartSimulation} 
                                        disabled={isScanning}
                                        className="w-48"
                                        icon={!isScanning && <Play size={16} />}
                                    >
                                        {isScanning ? 'SCANNING...' : 'INITIATE SCAN'}
                                    </CyberButton>
                                    
                                    <button
                                        onClick={() => setIsScriptModalOpen(true)} 
                                        className="text-xs font-mono text-yellow-600 hover:text-yellow-500 flex items-center gap-2 transition-colors"
                                    >
                                        <Code size={14} /> View Source
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Warning Box */}
                        <div className="lg:w-72 shrink-0">
                             <div className="bg-yellow-900/10 border border-yellow-900/50 rounded p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="text-yellow-600 shrink-0" size={20} />
                                    <div>
                                        <h4 className="text-yellow-500 font-bold text-sm font-mono mb-1">SIMULATION MODE</h4>
                                        <p className="text-xs text-yellow-600/80 leading-relaxed">
                                            Browser environment restricts raw socket access. This visualizer uses mock data based on your profile selection. For real pentesting, download the Python artifact.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ScanVisualizer isScanning={isScanning} results={scanResults} />

                    {/* Results Grid */}
                    {scanResults.length > 0 && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {scanResults.map((result, idx) => (
                                <div key={idx} className="bg-zinc-900/40 border border-cyan-900/30 p-3 rounded flex justify-between items-center group hover:border-cyan-500/50 transition-colors">
                                    <div>
                                        <div className="text-xs text-zinc-500 font-mono uppercase">{result.service}</div>
                                        <div className="text-lg font-mono text-cyan-400 font-bold">:{result.port}</div>
                                    </div>
                                    <div className="px-2 py-1 bg-green-900/20 text-green-400 text-[10px] border border-green-900/50 rounded uppercase">
                                        {result.state}
                                    </div>
                                </div>
                            ))}
                         </div>
                    )}

                    {generatedLog && (
                        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded relative animate-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-cyan-500 font-mono text-sm">>> SCAN_RESULT.LOG</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-xs text-zinc-600 font-mono">COMPLETE</span>
                                </div>
                            </div>
                            <pre className="font-mono text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed mb-4">
                                {generatedLog}
                            </pre>
                            <div className="flex justify-end">
                                 <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedLog);
                                        setActiveTab(AppTab.ANALYZER);
                                    }}
                                    className="text-xs text-white bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded font-bold transition-colors shadow-[0_0_15px_rgba(8,145,178,0.4)]"
                                 >
                                    SEND TO INTEL ANALYZER
                                 </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === AppTab.ANALYZER && (
                <AnalysisDashboard />
            )}
        </main>

        {/* History Sidebar */}
        <aside className={`
            fixed inset-y-0 right-0 w-80 bg-black/95 border-l border-zinc-800 backdrop-blur-xl transform transition-transform duration-300 z-40 pt-20 p-6
            ${showHistory ? 'translate-x-0' : 'translate-x-full'}
            lg:relative lg:translate-x-0 lg:bg-transparent lg:pt-6 lg:w-72 lg:border-l-0 ${!showHistory ? 'lg:hidden' : ''}
        `}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-mono font-bold flex items-center gap-2">
                    <Clock size={16} className="text-cyan-500" /> RECENT_OPS
                </h3>
                <button onClick={() => setHistory([])} className="text-zinc-600 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                </button>
            </div>
            
            <div className="space-y-3">
                {history.length === 0 ? (
                    <div className="text-center py-10 text-zinc-700 text-xs font-mono">
                        NO_OPERATIONS_LOGGED
                    </div>
                ) : (
                    history.map(item => (
                        <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded hover:border-cyan-500/30 transition-colors group cursor-default">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-zinc-500 font-mono">{item.timestamp}</span>
                                <span className={`text-[10px] px-1.5 rounded uppercase ${item.config.profile === 'stealth' ? 'bg-blue-900/20 text-blue-400' : 'bg-red-900/20 text-red-400'}`}>
                                    {item.config.profile}
                                </span>
                            </div>
                            <div className="text-sm text-zinc-300 font-mono mb-1">{item.config.targetIp}</div>
                            <div className="flex justify-between items-end">
                                <div className="text-xs text-zinc-500">{item.portCount} ports open</div>
                                <ChevronRight size={14} className="text-zinc-700 group-hover:text-cyan-500 transition-colors" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </aside>
      </div>
    </div>
  );
}
