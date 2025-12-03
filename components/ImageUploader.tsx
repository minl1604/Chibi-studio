import React, { useCallback, useState } from 'react';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../constants';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError("Vui lòng tải lên file ảnh (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File quá lớn! Vui lòng chọn ảnh dưới ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        onImageSelected(e.target.result);
      }
    };
    reader.onerror = () => setError("Không thể đọc file. Vui lòng thử lại.");
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className={`
          relative border-4 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 scale-105' 
            : 'border-slate-300 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500 bg-white dark:bg-slate-800'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleInputChange}
        />
        
        <div className="space-y-4 pointer-events-none">
          <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/50 text-rose-500 dark:text-rose-300 rounded-full flex items-center justify-center mx-auto text-3xl">
            📷
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Tải ảnh chân dung lên</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
              Kéo thả hoặc chạm để chọn ảnh
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              JPG, PNG, WEBP (Max {MAX_FILE_SIZE_MB}MB)
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-center text-sm font-medium animate-pulse">
          {error}
        </div>
      )}
    </div>
  );
};