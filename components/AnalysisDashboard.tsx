import React, { useState } from 'react';
import { analyzeSecurityLog } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { CyberButton } from './CyberButton';
import { AlertTriangle, BrainCircuit, CheckCircle, FileText, Shield } from 'lucide-react';

export const AnalysisDashboard: React.FC = () => {
  const [logInput, setLogInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!logInput.trim()) return;
    setIsAnalyzing(true);
    const analysis = await analyzeSecurityLog(logInput);
    setResult(analysis);
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-500';
    if (score < 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Left Column: Input */}
      <div className="flex flex-col gap-4">
        <div className="bg-zinc-900/30 p-4 border border-zinc-800 rounded-lg">
            <h3 className="text-lg font-mono text-cyan-400 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> INPUT LOGS
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
                Paste output from the <strong>provided Python script</strong>, Nmap, or any server log here. 
                The AI will analyze port configurations and service banners.
            </p>
            <textarea
            value={logInput}
            onChange={(e) => setLogInput(e.target.value)}
            placeholder={`Example Output:
============================================================
Scan Report
============================================================
Target: 192.168.1.45 (192.168.1.45)
Open ports found: 3
============================================================

PORT		STATE		SERVICE
------------------------------------------------------------
22		    open		SSH
80		    open		HTTP/Web Server
3306		open		MySQL`}
            className="w-full h-64 bg-black/50 border border-zinc-700 rounded p-4 font-mono text-sm text-zinc-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none custom-scrollbar"
            spellCheck={false}
            />
            <div className="mt-4 flex justify-end">
                <CyberButton 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || !logInput}
                    icon={isAnalyzing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <BrainCircuit size={18} />}
                >
                    {isAnalyzing ? 'ANALYZING DATA...' : 'INITIATE AI ANALYSIS'}
                </CyberButton>
            </div>
        </div>
      </div>

      {/* Right Column: Output */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg relative overflow-hidden flex flex-col">
         {!result ? (
             <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-12 text-center">
                 <Shield className="w-16 h-16 mb-4 opacity-20" />
                 <p className="font-mono text-sm">AWAITING DATA STREAM FOR ANALYSIS</p>
             </div>
         ) : (
             <div className="flex-1 p-6 overflow-y-auto">
                 {/* Header Summary */}
                 <div className="flex justify-between items-start mb-6 pb-6 border-b border-zinc-800">
                    <div>
                        <h2 className="text-xl text-white font-bold mb-2">SECURITY ASSESSMENT</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-md">{result.summary}</p>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-lg border border-zinc-800">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Risk Score</div>
                        <div className={`text-4xl font-bold ${getScoreColor(result.riskScore)}`}>
                            {result.riskScore}
                        </div>
                    </div>
                 </div>

                 {/* Vulnerabilities */}
                 <div className="mb-6">
                    <h3 className="text-red-400 font-mono text-sm font-bold mb-3 flex items-center gap-2">
                        <AlertTriangle size={14} /> DETECTED VULNERABILITIES
                    </h3>
                    <ul className="space-y-2">
                        {result.vulnerabilities.map((vuln, idx) => (
                            <li key={idx} className="bg-red-900/10 border-l-2 border-red-500 p-3 text-sm text-red-100/80">
                                {vuln}
                            </li>
                        ))}
                        {result.vulnerabilities.length === 0 && (
                            <li className="text-zinc-500 italic text-sm">No critical vulnerabilities detected in provided snippet.</li>
                        )}
                    </ul>
                 </div>

                 {/* Recommendations */}
                 <div>
                    <h3 className="text-cyan-400 font-mono text-sm font-bold mb-3 flex items-center gap-2">
                        <CheckCircle size={14} /> HARDENING RECOMMENDATIONS
                    </h3>
                    <ul className="space-y-2">
                        {result.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-3 p-3 bg-cyan-900/10 rounded border border-cyan-900/30">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0"></div>
                                <span className="text-sm text-zinc-300">{rec}</span>
                            </li>
                        ))}
                    </ul>
                 </div>
             </div>
         )}
         {/* Background Decorative Elements */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
      </div>
    </div>
  );
};