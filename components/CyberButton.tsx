import React from 'react';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
}

export const CyberButton: React.FC<CyberButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyle = "relative px-6 py-3 font-mono font-bold text-sm tracking-wider transition-all duration-200 border clip-path-polygon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group";
  
  const variants = {
    primary: "bg-cyan-900/20 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black focus:ring-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]",
    danger: "bg-red-900/20 border-red-500 text-red-400 hover:bg-red-500 hover:text-black focus:ring-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
    ghost: "bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="group-hover:scale-110 transition-transform">{icon}</span>}
      {children}
      {/* Corner Accents */}
      <span className="absolute top-0 left-0 w-1 h-1 bg-current opacity-50"></span>
      <span className="absolute bottom-0 right-0 w-1 h-1 bg-current opacity-50"></span>
    </button>
  );
};