import React from 'react';
import { GLOSSARY } from '../utils/glossary';

interface TooltipProps {
  termKey?: string; // Key from the GLOSSARY object
  customText?: string; // Or provide direct text
  children: React.ReactNode; // The trigger element (label)
}

const Tooltip: React.FC<TooltipProps> = ({ termKey, customText, children }) => {
  const description = termKey ? GLOSSARY[termKey] : customText;

  if (!description) {
    return <>{children}</>;
  }

  return (
    <div className="group relative inline-flex items-center gap-1 cursor-help">
      {/* The Label/Trigger */}
      <span className="border-b border-dotted border-slate-400 group-hover:border-brand-500 group-hover:text-brand-600 transition-colors">
        {children}
      </span>
      
      {/* The Icon */}
      <svg 
        className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

      {/* The Tooltip Popup */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
        <div className="bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl relative text-center leading-relaxed">
          {description}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
        </div>
      </div>
    </div>
  );
};

export default Tooltip;