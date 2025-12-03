import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { analyzeImage } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface MagicScannerProps {
  imageBase64: string;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onClose: () => void;
}

export const MagicScanner: React.FC<MagicScannerProps> = ({ 
  imageBase64, 
  onAnalysisComplete,
  onClose
}) => {
  const [statusText, setStatusText] = useState("Đang khởi động máy quét AI...");

  useEffect(() => {
    let mounted = true;

    const runAnalysis = async () => {
      try {
        await new Promise(r => setTimeout(r, 800)); // Intro delay
        if (!mounted) return;
        setStatusText("Đang phân tích đặc điểm khuôn mặt...");
        
        const result = await analyzeImage(imageBase64);
        
        if (!mounted) return;
        setStatusText("Đã tìm thấy đặc điểm!");
        await new Promise(r => setTimeout(r, 500)); // Success delay
        
        onAnalysisComplete(result);
      } catch (e) {
        console.error(e);
        onClose(); // Fail silently/close
      }
    };

    runAnalysis();

    return () => { mounted = false; };
  }, [imageBase64, onAnalysisComplete, onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 rounded-2xl overflow-hidden bg-black/80 backdrop-blur-md flex flex-col items-center justify-center"
    >
      
      {/* Scanning Image Container */}
      <div className="relative w-64 h-64 rounded-xl overflow-hidden border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
        <img 
          src={imageBase64} 
          className="w-full h-full object-cover opacity-50" 
          alt="Scanning"
        />
        
        {/* Scanning Line Animation */}
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-scan" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      <div className="mt-6 text-center space-y-2">
        <h3 className="text-xl font-bold text-cyan-400 animate-pulse">MAGIC SCAN</h3>
        <p className="text-gray-300 text-sm font-mono">{statusText}</p>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </motion.div>
  );
};