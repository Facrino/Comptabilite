import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAccounting } from '../services/store';
import { cn } from '../lib/utils';

export function PeriodSelector() {
  const { currentPeriod, setCurrentPeriod } = useAccounting();

  const [year, month] = currentPeriod.split('-').map(Number);

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handlePrev = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setCurrentPeriod(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNext = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    setCurrentPeriod(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 shadow-sm px-3 py-2">
      <div className="flex items-center gap-2 mr-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
           <Calendar className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Période</span>
          <span className="text-sm font-bold text-slate-900 leading-tight">
            {months[month - 1]} {year}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <button 
          onClick={handlePrev}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button 
          onClick={handleNext}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
