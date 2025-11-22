
import React from 'react';
import { Settings, Target, Zap, Eye, Activity } from 'lucide-react';
import { ScanConfig } from '../types';

interface ScanConfigPanelProps {
  config: ScanConfig;
  setConfig: (config: ScanConfig) => void;
  disabled: boolean;
}

export const ScanConfigPanel: React.FC<ScanConfigPanelProps> = ({ config, setConfig, disabled }) => {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 mb-6 animate-in slide-in-from-left-2">
      <div className="flex items-center gap-2 mb-4 text-cyan-500 border-b border-zinc-800/50 pb-2">
        <Settings size={16} />
        <h3 className="font-mono text-sm font-bold">OPERATION_PARAMETERS</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Target Input */}
        <div>
          <label className="block text-xs font-mono text-zinc-500 mb-2 flex items-center gap-2">
            <Target size={12} /> TARGET_IP / HOSTNAME
          </label>
          <input
            type="text"
            value={config.targetIp}
            onChange={(e) => setConfig({ ...config, targetIp: e.target.value })}
            disabled={disabled}
            className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50 transition-colors"
            placeholder="192.168.1.1"
          />
        </div>

        {/* Profile Select */}
        <div>
          <label className="block text-xs font-mono text-zinc-500 mb-2">SCAN_PROFILE</label>
          <div className="flex gap-2">
            {[
              { id: 'stealth', icon: <Eye size={14} />, label: 'STEALTH' },
              { id: 'aggressive', icon: <Zap size={14} />, label: 'AGGRESSIVE' },
              { id: 'full', icon: <Activity size={14} />, label: 'FULL_RANGE' },
            ].map((profile) => (
              <button
                key={profile.id}
                onClick={() => setConfig({ ...config, profile: profile.id as any })}
                disabled={disabled}
                className={`flex-1 flex flex-col items-center justify-center p-2 rounded border text-[10px] font-mono font-bold transition-all ${
                  config.profile === profile.id
                    ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(8,145,178,0.2)]'
                    : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {profile.icon}
                <span className="mt-1">{profile.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
