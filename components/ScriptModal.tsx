import React from 'react';
import { X, Copy, Check, Download } from 'lucide-react';
import { CyberButton } from './CyberButton';

interface ScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
}

export const ScriptModal: React.FC<ScriptModalProps> = ({ isOpen, onClose, code }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#050505] border border-cyan-900/50 rounded-lg shadow-[0_0_50px_rgba(8,145,178,0.1)] flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/30 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></div>
            <h3 className="text-cyan-400 font-mono font-bold ml-2 text-sm">port_scanner.py</h3>
          </div>
          <div className="flex items-center gap-2">
             <CyberButton variant="ghost" onClick={handleCopy} className="!py-1 !px-3 text-xs h-8">
                {copied ? <Check size={14} className="mr-1 text-green-400"/> : <Copy size={14} className="mr-1"/>}
                {copied ? 'COPIED TO BUFFER' : 'COPY SOURCE'}
             </CyberButton>
             <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors hover:bg-zinc-800 rounded">
                <X size={20} />
             </button>
          </div>
        </div>
        <div className="p-0 overflow-hidden relative flex-1 bg-[#0a0a0a]">
            <div className="absolute inset-0 overflow-auto custom-scrollbar p-6">
                <pre className="font-mono text-xs sm:text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap break-all">
                    <code className="language-python">{code}</code>
                </pre>
            </div>
        </div>
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/20 text-xs text-zinc-500 font-mono flex justify-between items-center rounded-b-lg">
            <span>LINES: {code.split('\n').length} | ENCODING: UTF-8</span>
            <span className="flex items-center gap-1 text-yellow-600">
                <span className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></span>
                USE WITH CAUTION
            </span>
        </div>
      </div>
    </div>
  );
};