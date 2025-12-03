import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ImageComparisonProps {
  originalImage: string;
  generatedImage: string;
  isEditing?: boolean;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({ 
  originalImage, 
  generatedImage,
  isEditing 
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);
  
  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(x, 0), 100));
  };

  const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
    if (!isResizing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(x, 0), 100));
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove as any);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove as any);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove as any);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="w-full select-none">
      {/* Container */}
      <div 
        ref={containerRef}
        className={`relative w-full max-w-[500px] mx-auto rounded-[2rem] overflow-hidden shadow-2xl border border-border cursor-crosshair group ${isZoomed ? 'scale-110 z-50' : ''} transition-transform duration-300`}
        style={{ aspectRatio: '1/1' }} // Assuming square for simplicity, but object-contain handles others
      >
        {/* Generated Image (Background) */}
        <img 
          src={generatedImage} 
          alt="Generated" 
          className={`absolute inset-0 w-full h-full object-contain bg-white dark:bg-gray-800 transition-opacity duration-300 ${isEditing ? 'opacity-50 blur-sm' : ''}`} 
        />
        
        {/* Original Image (Foreground - Clipped) */}
        <div 
          className="absolute inset-0 overflow-hidden bg-white dark:bg-gray-800"
          style={{ width: `${sliderPosition}%` }}
        >
          <img 
            src={originalImage} 
            alt="Original" 
            className="absolute inset-0 w-full h-full object-contain max-w-none" 
            // We need to set width to the parent container's width to ensure alignment
            style={{ width: containerRef.current?.offsetWidth || '100%' }}
          />
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-rose-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rotate-180 absolute"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>

        {/* Loading Spinner for Edit */}
        {isEditing && (
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}

        {/* Zoom Button */}
        <button 
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-20"
        >
           {isZoomed ? (
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
           ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
           )}
        </button>

        {/* Label Overlays */}
        <div className="absolute top-4 left-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm pointer-events-none">GỐC</div>
        <div className="absolute top-4 right-4 bg-rose-500/80 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm pointer-events-none">CHIBI</div>
      </div>
      
      <p className="text-center text-xs text-muted-foreground mt-2">Kéo thanh trượt để so sánh</p>
    </div>
  );
};