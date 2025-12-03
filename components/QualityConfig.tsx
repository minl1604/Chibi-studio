import React from 'react';
import { ModelType, AspectRatio } from '../types';

interface QualityConfigProps {
  modelType: ModelType;
  aspectRatio: AspectRatio;
  onModelChange: (model: ModelType) => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
}

export const QualityConfig: React.FC<QualityConfigProps> = ({
  modelType,
  aspectRatio,
  onModelChange,
  onAspectRatioChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
      
      {/* Chỉ còn Tiêu chuẩn (Nhanh) – không còn Pro */}
      <div>
        <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
          Chất lượng ảnh
        </label>
        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onModelChange(ModelType.FLASH)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-default ${
              modelType === ModelType.FLASH
                ? 'bg-white dark:bg-slate-600 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Tiêu chuẩn (Nhanh)
          </button>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 px-1">
          Tạo ảnh nhanh chóng, thích hợp để chia sẻ mạng xã hội.
        </p>
      </div>

      {/* Khung hình (Crop) giữ nguyên */}
      <div>
        <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
          Khung hình (Crop)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: '1:1', label: 'Vuông' },
            { id: '3:4', label: 'Dọc' },
            { id: '4:3', label: 'Ngang' },
            { id: '16:9', label: 'Rộng' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onAspectRatioChange(item.id as AspectRatio)}
              className={`
                py-2 border-2 rounded-xl text-sm font-bold transition-all
                ${
                  aspectRatio === item.id
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
