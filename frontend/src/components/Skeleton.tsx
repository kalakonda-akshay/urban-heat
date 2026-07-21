import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel p-6 rounded-xl border border-slate-800 shadow-glass-shadow shimmer-sweep">
      <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-slate-800 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-slate-800 rounded w-1/2"></div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="glass-panel p-6 rounded-xl border border-slate-800 shadow-glass-shadow shimmer-sweep w-full">
      <div className="h-5 bg-slate-800 rounded w-1/4 mb-6"></div>
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-4 border-b border-slate-800 pb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-slate-800 rounded w-2/3"></div>
          ))}
        </div>
        {[...Array(rows)].map((_, index) => (
          <div key={index} className="grid grid-cols-5 gap-4 py-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 bg-slate-800 rounded w-4/5"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="glass-panel p-6 rounded-xl border border-slate-800 shadow-glass-shadow shimmer-sweep w-full h-[300px] flex flex-col justify-end">
      <div className="h-5 bg-slate-800 rounded w-1/4 mb-6 self-start"></div>
      <div className="flex items-end justify-between space-x-4 h-full px-2">
        <div className="h-[20%] bg-slate-800 rounded w-full"></div>
        <div className="h-[45%] bg-slate-800 rounded w-full"></div>
        <div className="h-[30%] bg-slate-800 rounded w-full"></div>
        <div className="h-[65%] bg-slate-800 rounded w-full"></div>
        <div className="h-[80%] bg-slate-800 rounded w-full"></div>
        <div className="h-[50%] bg-slate-800 rounded w-full"></div>
        <div className="h-[90%] bg-slate-800 rounded w-full"></div>
      </div>
      <div className="h-3 bg-slate-800 rounded w-full mt-4"></div>
    </div>
  );
};
