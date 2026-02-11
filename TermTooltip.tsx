
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TermTooltipProps {
  term: string;
  termEn?: string;
  definition: string;
  children: React.ReactNode;
  className?: string;
}

export const TermTooltip: React.FC<TermTooltipProps> = ({ term, termEn, definition, children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className="cursor-help border-b border-dotted border-indigo-400 hover:text-indigo-600 transition-colors inline-flex items-center gap-1">
        {children}
        <HelpCircle size={12} className="opacity-40" />
      </span>
      {isVisible && (
        <div className="absolute z-[100] bottom-full mb-3 w-72 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 pointer-events-none border border-slate-700 text-right">
          <div className="flex justify-between items-start mb-2 border-b border-slate-700 pb-2 gap-2">
            <span className="font-bold text-sm academic-font">{term}</span>
            {termEn && <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-sans">{termEn}</span>}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            {definition}
          </p>
          {/* Tooltip Arrow */}
          <div className="absolute top-full right-6 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
};
