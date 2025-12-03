import React from 'react';
import { motion } from 'framer-motion';
import { QUICK_FILTERS, BACKGROUND_OPTIONS, COLOR_PALETTES } from '../constants';
import { BackgroundOption } from '../types';

interface QuickFiltersProps {
  activeFilters: string[];
  onToggleFilter: (id: string) => void;
  selectedBackground: BackgroundOption;
  onSelectBackground: (id: BackgroundOption) => void;
  selectedColorPalette: string;
  onSelectColorPalette: (id: string) => void;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  activeFilters,
  onToggleFilter,
  selectedBackground,
  onSelectBackground,
  selectedColorPalette,
  onSelectColorPalette
}) => {
  return (
    <div className="space-y-6">
      {/* Background Selection */}
      <div>
        <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
           Nền (Background)
        </label>
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
          {BACKGROUND_OPTIONS.map((bg) => {
            const isSelected = selectedBackground === bg.id;
            return (
              <motion.button
                key={bg.id}
                onClick={() => onSelectBackground(bg.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl border-2 transition-all snap-start
                  ${isSelected 
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30' 
                    : 'border-transparent bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm'}
                `}
              >
                <span className="text-2xl mb-1">{bg.icon}</span>
                <span className={`text-xs font-bold ${isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {bg.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Color Palette Selection */}
      <div>
        <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
           Màu chủ đạo (Vibe)
        </label>
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
          {COLOR_PALETTES.map((color) => {
             const isSelected = selectedColorPalette === color.id;
             return (
               <motion.button
                 key={color.id}
                 onClick={() => onSelectColorPalette(color.id)}
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.95 }}
                 className={`
                   relative flex flex-col items-center gap-1 min-w-[60px] snap-start
                 `}
               >
                 <div 
                   className={`w-12 h-12 rounded-full shadow-sm border-2 transition-all flex items-center justify-center
                     ${isSelected ? 'border-rose-500 scale-110' : 'border-white dark:border-slate-600'}
                   `}
                   style={{ backgroundColor: color.hex }}
                 >
                   {isSelected && <span className="text-xs">✨</span>}
                 </div>
                 <span className={`text-[10px] font-bold ${isSelected ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
                   {color.label}
                 </span>
               </motion.button>
             )
          })}
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
          Bộ lọc nhanh (Filters)
        </label>
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((filter) => {
            const isActive = activeFilters.includes(filter.id);
            return (
              <motion.button
                key={filter.id}
                onClick={() => onToggleFilter(filter.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-4 py-2 rounded-full text-sm font-bold border transition-all
                  ${isActive 
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200 dark:shadow-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300'}
                `}
              >
                {isActive && <span className="mr-1">✓</span>}
                {filter.label}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};