import React from 'react';

interface BentoGridItemProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoGridItem: React.FC<BentoGridItemProps> = ({ children, className }) => {
  return (
    <div className={`bg-white/30 backdrop-blur-lg rounded-hamham p-6 border border-white/20 shadow-xl transition-all hover:bg-white/40 ${className}`}>
      {children}
    </div>
  );
};

export const BentoGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="grid grid-cols-12 gap-6 auto-rows-min">
      {children}
    </div>
  );
};
