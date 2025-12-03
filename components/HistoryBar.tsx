import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoryItem } from '../types';

interface HistoryBarProps {
  history: HistoryItem[];
  onSelect: (url: string) => void;
  onDelete: (id: string) => void;
}

export const HistoryBar: React.FC<HistoryBarProps> = ({ history, onSelect, onDelete }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full mt-8 border-t border-border pt-6">
      <h4 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
        <span className="text-lg">🕰️</span> Lịch sử tạo ảnh
      </h4>
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x min-h-[120px]">
        <AnimatePresence>
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0, width: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary group snap-start"
              onClick={() => onSelect(item.url)}
            >
              <img 
                src={item.url} 
                alt="History" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              
              {/* Delete Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                title="Xóa ảnh này"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};