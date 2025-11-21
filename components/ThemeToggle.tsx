import React from 'react';
import { Sun, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center gap-2 px-3 py-1.5 rounded border transition-all duration-300
        ${theme === 'cyberpunk' 
          ? 'bg-black/50 border-zinc-700 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500' 
          : 'bg-white border-white text-black font-bold hover:bg-gray-200'}
      `}
      aria-label="Toggle High Contrast Mode"
    >
      {theme === 'cyberpunk' ? (
        <>
          <Eye size={14} />
          <span className="text-[10px] font-mono uppercase tracking-wider">View: Std</span>
        </>
      ) : (
        <>
          <Sun size={14} />
          <span className="text-[10px] font-mono uppercase tracking-wider">View: High-Vis</span>
        </>
      )}
    </button>
  );
};