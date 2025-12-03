import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 md:p-8 pb-4 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-2xl font-black text-gray-800 dark:text-white">
                  Chào mừng bạn! 👋
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Vài mẹo nhỏ để có bức ảnh Chibi ưng ý nhất.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 pt-0 space-y-6 overflow-y-auto custom-scrollbar">
              
              {/* Main Flow */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Cách sử dụng</h3>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-500 font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Tải & Chỉnh sửa ảnh</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Upload ảnh rõ mặt. Bạn có thể <span className="font-semibold text-rose-500">xoay</span> hoặc <span className="font-semibold text-rose-500">chỉnh sáng</span> ngay trên app.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-500 font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Chọn Style & Mô tả</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Chọn phong cách (Anime, Tết...). Dùng nút <span className="inline-block align-middle"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></span> để <b>nhập bằng giọng nói</b> nếu bạn lười gõ!
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-500 font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Tùy biến & Tạo</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Chọn khung hình (Vuông, Dọc) phù hợp để đăng Facebook/Story.
                    </p>
                  </div>
                </div>
              </div>

              {/* Extra Features */}
              <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tính năng khác</h3>
                
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-yellow-500 shrink-0 text-xl">
                    🌓
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Chế độ Sáng / Tối</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Bấm vào icon ☀️/🌙 ở góc trên bên phải để đổi giao diện theo ý thích.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-green-500 shrink-0 text-xl">
                    ✂️
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Crop & Tỷ lệ</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Hỗ trợ nhiều tỷ lệ khung hình: 1:1, 3:4 (Story), 16:9 (PC).
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 pt-4 shrink-0 bg-gray-50 dark:bg-gray-800/50">
              <Button fullWidth onClick={onClose}>
                Đã hiểu, bắt đầu thôi! 🚀
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};