import React, { useState, useEffect } from 'react';
import { Activity, Server, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PortResult } from '../types';

interface ScanVisualizerProps {
  isScanning: boolean;
  results: PortResult[];
}

export const ScanVisualizer: React.FC<ScanVisualizerProps> = ({ isScanning, results }) => {
  const [scannedCount, setScannedCount] = useState(0);
  
  // Common ports to visualize grid
  const commonPorts = [
    20, 21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 
    3306, 3389, 5432, 5900, 6379, 8000, 8080, 8443, 27017
  ];

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScannedCount(prev => (prev < 65535 ? prev + 421 : 65535));
      }, 50);
      return () => clearInterval(interval);
    } else {
        // Reset when not scanning but keep 65535 if finished
        if(results.length === 0) setScannedCount(0);
    }
  }, [isScanning, results]);

  const getPortStatus = (port: number) => {
    const found = results.find(r => r.port === port);
    if (found) return found.state;
    if (isScanning && Math.random() > 0.95) return 'scanning'; 
    return 'unknown';
  };

  return (
    <div className="w-full p-6 border border-cyan-900/50 bg-black/40 rounded-lg backdrop-blur-sm relative overflow-hidden">
       {/* Scanning Line Animation */}
       {isScanning && (
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-[scan_2s_ease-in-out_infinite]" style={{ top: `${(scannedCount / 65535) * 100}%` }}></div>
      )}

      <div className="flex justify-between items-end mb-6 border-b border-zinc-800 pb-4">
        <div>
            <h3 className="text-xl font-mono font-bold text-cyan-400 flex items-center gap-2">
                <Activity className="w-5 h-5" /> NETWORK VISUALIZER
            </h3>
            <p className="text-xs text-zinc-500 mt-1">TARGET: 192.168.1.X (SIMULATION)</p>
        </div>
        <div className="text-right">
            <div className="text-2xl font-mono font-bold text-white">{scannedCount.toLocaleString()} / 65,535</div>
            <div className="text-xs text-cyan-600 uppercase tracking-widest">Ports Traversed</div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-3 mb-6">
        {commonPorts.map(port => {
            const status = getPortStatus(port);
            let colorClass = "border-zinc-800 text-zinc-600 bg-zinc-900/50";
            let icon = <Server size={14} />;
            
            if (status === 'open') {
                colorClass = "border-red-500/50 text-red-400 bg-red-900/20 shadow-[0_0_10px_rgba(220,38,38,0.2)]";
                icon = <ShieldAlert size={14} />;
            } else if (status === 'closed') {
                colorClass = "border-green-900 text-green-700 bg-green-900/10";
                icon = <ShieldCheck size={14} />;
            }

            return (
                <div key={port} className={`h-16 border rounded flex flex-col items-center justify-center transition-all duration-300 ${colorClass}`}>
                    <span className="text-xs font-mono mb-1">{port}</span>
                    {icon}
                </div>
            )
        })}
      </div>

      {/* Log Output for Visualizer */}
      <div className="bg-black border border-zinc-800 p-4 font-mono text-xs h-40 overflow-y-auto text-zinc-400 rounded">
        {isScanning ? (
            <>
                <div className="text-cyan-500 animate-pulse">{'>'} Initiating stealth SYN scan...</div>
                <div className="text-zinc-500">{'>'} Resolving hostname... Done.</div>
                <div className="text-zinc-500">{'>'} RTT 0.04s. Batch size 1000.</div>
                {results.map((r, i) => (
                    <div key={i} className="text-red-400">
                        {`> [+] Discovered open port ${r.port}/tcp on 192.168.1.5 [${r.service}]`}
                    </div>
                ))}
                <div className="text-zinc-600 mt-2">... Scanning sectors ...</div>
            </>
        ) : results.length > 0 ? (
            <div className="text-green-500">{'>'} Scan Complete. {results.length} open ports found.</div>
        ) : (
            <div className="text-zinc-600 italic">{'>'} System Ready. Awaiting command.</div>
        )}
      </div>
    </div>
  );
};