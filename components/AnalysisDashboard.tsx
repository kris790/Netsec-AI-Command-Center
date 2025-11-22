
import React, { useState, useRef, useEffect } from 'react';
import { analyzeSecurityLog, getChatResponse } from '../services/geminiService';
import { AnalysisResult, ChatMessage } from '../types';
import { CyberButton } from './CyberButton';
import { AlertTriangle, BrainCircuit, CheckCircle, FileText, Shield, Send, Bot, User, MessageSquare } from 'lucide-react';

export const AnalysisDashboard: React.FC = () => {
  const [logInput, setLogInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleAnalyze = async () => {
    if (!logInput.trim()) return;
    setIsAnalyzing(true);
    
    // Reset chat on new analysis
    setChatMessages([]); 
    
    const analysis = await analyzeSecurityLog(logInput);
    setResult(analysis);
    setIsAnalyzing(false);

    // Add initial AI greeting based on analysis
    const initialMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'ai',
        text: `I've analyzed the logs. Risk Score is ${analysis.riskScore}/100. I'm ready to discuss mitigation strategies for the ${analysis.vulnerabilities.length} detected vulnerabilities.`,
        timestamp: Date.now()
    };
    setChatMessages([initialMsg]);
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    const newUserMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: userMessage,
        timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, newUserMsg]);
    setUserMessage('');
    setIsChatting(true);

    // Prepare history for Gemini
    // We include the log context in the history implicitly by how we started, 
    // but for the API call, we construct the 'history' array.
    const apiHistory = [
        {
            role: 'user',
            parts: [{ text: `Here is the log context we are discussing:\n${logInput}\n\nAnalysis Summary: ${JSON.stringify(result)}` }]
        },
        {
            role: 'model',
            parts: [{ text: "Understood. I have context of the scan. Ready for questions." }]
        },
        ...chatMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }))
    ];

    const responseText = await getChatResponse(apiHistory, newUserMsg.text);

    const newAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: responseText || "Signal lost. Please retry.",
        timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, newAiMsg]);
    setIsChatting(false);
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-500';
    if (score < 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Left Column: Input & Report */}
      <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
        <div className="bg-zinc-900/30 p-4 border border-zinc-800 rounded-lg">
            <h3 className="text-lg font-mono text-cyan-400 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> INPUT LOGS
            </h3>
            <textarea
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                placeholder="Paste scan results here..."
                className="w-full h-48 bg-black/50 border border-zinc-700 rounded p-4 font-mono text-xs text-zinc-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none custom-scrollbar"
                spellCheck={false}
            />
            <div className="mt-4 flex justify-end">
                <CyberButton 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || !logInput}
                    icon={isAnalyzing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <BrainCircuit size={18} />}
                >
                    {isAnalyzing ? 'PROCESSING...' : 'ANALYZE LOGS'}
                </CyberButton>
            </div>
        </div>

        {/* Static Analysis Result */}
        {result && (
             <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-lg p-6 animate-in slide-in-from-bottom-4">
                 <div className="flex justify-between items-start mb-6 pb-6 border-b border-zinc-800">
                    <div>
                        <h2 className="text-xl text-white font-bold mb-2">ASSESSMENT REPORT</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-md">{result.summary}</p>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-lg border border-zinc-800">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Risk Score</div>
                        <div className={`text-4xl font-bold ${getScoreColor(result.riskScore)}`}>
                            {result.riskScore}
                        </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div>
                        <h3 className="text-red-400 font-mono text-xs font-bold mb-2 flex items-center gap-2">
                            <AlertTriangle size={12} /> VULNERABILITIES
                        </h3>
                        <ul className="space-y-1">
                            {result.vulnerabilities.map((vuln, idx) => (
                                <li key={idx} className="text-xs text-zinc-300 pl-2 border-l-2 border-red-900/50">
                                    {vuln}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-cyan-400 font-mono text-xs font-bold mb-2 flex items-center gap-2">
                            <CheckCircle size={12} /> RECOMMENDATIONS
                        </h3>
                        <ul className="space-y-1">
                            {result.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-xs text-zinc-300 pl-2 border-l-2 border-cyan-900/50">
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                 </div>
             </div>
         )}
      </div>

      {/* Right Column: Interactive AI Chat */}
      <div className="bg-black/40 border border-zinc-800 rounded-lg relative overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
         <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
            <h3 className="font-mono text-cyan-400 font-bold flex items-center gap-2">
                <MessageSquare size={16} /> NETSEC_AI_CONSULTANT
            </h3>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-green-500 font-mono">ONLINE</span>
            </div>
         </div>

         {/* Chat Area */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
            {!result && chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                    <Bot size={48} className="mb-4" />
                    <p className="font-mono text-sm">AWAITING ANALYSIS DATA</p>
                </div>
            ) : (
                chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                            msg.role === 'user' ? 'bg-zinc-800 text-white' : 'bg-cyan-900/20 text-cyan-400 border border-cyan-500/30'
                        }`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`max-w-[80%] p-3 rounded text-sm leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-zinc-800 text-zinc-200 rounded-tr-none' 
                            : 'bg-cyan-950/30 border border-cyan-900/30 text-cyan-100 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))
            )}
            {isChatting && (
                 <div className="flex gap-3">
                    <div className="w-8 h-8 rounded bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                        <Bot size={16} />
                    </div>
                    <div className="bg-cyan-950/30 border border-cyan-900/30 p-3 rounded rounded-tl-none">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                 </div>
            )}
            <div ref={chatEndRef} />
         </div>

         {/* Input Area */}
         <div className="p-4 bg-zinc-900/50 border-t border-zinc-800">
             <div className="relative">
                 <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={!result || isChatting}
                    placeholder={result ? "Ask about mitigation..." : "Analyze logs first..."}
                    className="w-full bg-black border border-zinc-700 rounded-md pl-4 pr-12 py-3 text-sm font-mono text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                 />
                 <button 
                    onClick={handleSendMessage}
                    disabled={!result || isChatting || !userMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-900/20 text-cyan-400 hover:bg-cyan-500 hover:text-black rounded transition-colors disabled:opacity-0"
                 >
                    <Send size={16} />
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};
