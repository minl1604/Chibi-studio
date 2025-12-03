import React, { useState, useEffect } from 'react';
import { STYLES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface StyleSelectorProps {
  selectedStyleId: string;
  onSelect: (id: string) => void;
  customPrompt: string;
  onCustomPromptChange: (val: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ 
  selectedStyleId, 
  onSelect,
  customPrompt,
  onCustomPromptChange
}) => {
  const [isListening, setIsListening] = useState(false);
  const [supportSpeech, setSupportSpeech] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSupportSpeech(true);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) return; 

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        const newText = customPrompt.trim() 
          ? `${customPrompt} ${transcript}` 
          : transcript;
        onCustomPromptChange(newText);
      }
    };

    recognition.start();
  };

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-2 gap-4 w-full">
        {STYLES.map((style) => {
           const isSelected = selectedStyleId === style.id;
           return (
            <motion.button
              key={style.id}
              onClick={() => onSelect(style.id)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative overflow-hidden p-4 rounded-xl text-left border group transition-colors duration-200 shadow-sm
                ${isSelected 
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-900'}
              `}
            >
              {isSelected && (
                <motion.div
                  layoutId="outline"
                  className="absolute inset-0 border-2 border-rose-500 rounded-xl z-20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="relative z-10">
                <div className={`font-bold text-lg mb-1 flex items-center gap-2 ${isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-white'}`}>
                  {style.label}
                  {isSelected && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-rose-500 text-sm">★</motion.span>}
                </div>
                <div className={`text-xs leading-relaxed ${isSelected ? 'text-rose-800 dark:text-rose-200' : 'text-slate-500 dark:text-slate-400'}`}>{style.description}</div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative shadow-sm">
        <label className="block text-sm font-bold mb-2 flex justify-between items-center text-slate-800 dark:text-white">
          <span>Mô tả thêm</span>
          {supportSpeech && (
            <span className="text-xs font-normal text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md">
              Voice Input Available
            </span>
          )}
        </label>
        
        <div className="relative">
          <textarea
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            placeholder="Ví dụ: Thêm nơ đỏ trên tóc..."
            className="w-full p-3 pr-12 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 resize-none h-24 text-sm"
          />
          
          {supportSpeech && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleListening}
              className={`
                absolute right-3 bottom-3 p-2 rounded-full transition-colors
                ${isListening 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-rose-100 hover:text-rose-600'}
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};