import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import Lottie from 'lottie-react';
import { AppStep, ModelType, ImageSize, AspectRatio, AnalysisResult, BackgroundOption, HistoryItem } from './types';
import { STYLES, LOADING_MESSAGES, BACKGROUND_OPTIONS, COLOR_PALETTES, QUICK_FILTERS } from './constants';
import { Button } from './components/Button';
import { ImageUploader } from './components/ImageUploader';
import { StyleSelector } from './components/StyleSelector';
import { QualityConfig } from './components/QualityConfig';
import { HelpModal } from './components/HelpModal';
import { Background } from './components/Background';
import { MagicScanner } from './components/MagicScanner';
import { QuickFilters } from './components/QuickFilters';
import { HistoryBar } from './components/HistoryBar';
import { ImageComparison } from './components/ImageComparison';
import { IntroAnimation } from './components/IntroAnimation';
import { generateChibiImage, checkApiKeySelection, promptApiKeySelection, editGeneratedImage } from './services/geminiService';
import { processImage } from './services/imageUtils';
import { useSound } from './hooks/useSound';

// Wrapper to fetch Lottie JSON from URL safely
const RemoteLottie = ({ src, fallbackEmoji = "✨", ...props }: { src: string, fallbackEmoji?: string } & any) => {
  const [animationData, setAnimationData] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setAnimationData(null);
    
    fetch(src)
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        const contentType = res.headers.get("content-type");
        if (contentType && !contentType.includes("json") && !contentType.includes("text/plain")) {
           console.warn("Lottie source is likely not JSON", contentType);
        }
        return res.text();
      })
      .then(text => {
        try {
          const json = JSON.parse(text);
          setAnimationData(json);
        } catch (e) {
          console.warn("Invalid Lottie JSON:", e);
          setHasError(true);
        }
      })
      .catch(err => {
        console.warn("Failed to load Lottie:", err);
        setHasError(true);
      });
  }, [src]);

  if (hasError) {
    return <div className="w-full h-full flex items-center justify-center text-4xl animate-bounce">{fallbackEmoji}</div>;
  }

  if (!animationData) {
    return <div className="w-full h-full animate-pulse bg-gray-200/50 rounded-full" />;
  }
  
  return <Lottie animationData={animationData} {...props} />;
};

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  
  const [selectedStyleId, setSelectedStyleId] = useState<string>(STYLES[0].id);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [autoAnalysis, setAutoAnalysis] = useState<string>("");
  
  // New State for Background, Filters & Color
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>('simple');
  const [selectedColorPalette, setSelectedColorPalette] = useState<string>('default');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [modelType, setModelType] = useState<ModelType>(ModelType.FLASH);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [apiKeyVerified, setApiKeyVerified] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Editing State (Pre-gen)
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);

  // Magic Scan State
  const [showMagicScan, setShowMagicScan] = useState(false);

  // Edit Result State
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Audio Hook
  const { playClick, playSuccess, playTransition, startMusic, stopMusic } = useSound(soundEnabled);

  // Animation Variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  } as const;

  useEffect(() => {
    // Check local storage or HTML class to sync state
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    // Only show help if intro is finished or skipped
    // We defer this check until intro is done, see handleIntroComplete
    
    // Load history
    try {
      const savedHistory = localStorage.getItem('chibiHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Global BGM Logic: Try to play when soundEnabled is true.
  // Add a click listener to the document to unlock autoplay if blocked initially.
  useEffect(() => {
    if (soundEnabled && !showIntro) {
      const unlockAudio = () => {
        startMusic();
        // Remove listener once music starts successfully (or at least we tried on interaction)
        document.removeEventListener('click', unlockAudio);
      };
      
      // Try immediately
      startMusic();
      
      // Also listen for interaction
      document.addEventListener('click', unlockAudio);
      return () => document.removeEventListener('click', unlockAudio);
    } else {
      stopMusic();
    }
  }, [soundEnabled, startMusic, stopMusic, showIntro]);

  // Rotating loading messages
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
      return () => {
        clearInterval(interval);
      };
    } else {
      setLoadingMessageIndex(0);
    }
  }, [isLoading]);

  const handleIntroComplete = () => {
    setShowIntro(false);
    // After intro, check if we need to show help
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (!hasSeenIntro) {
      setShowHelp(true);
    }
  };

  const handleCloseHelp = () => {
    playClick();
    setShowHelp(false);
    localStorage.setItem('hasSeenIntro', 'true');
  };

  const toggleDarkMode = () => {
    playClick();
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const toggleFilter = (id: string) => {
    playClick();
    setActiveFilters(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (modelType === ModelType.PRO) {
      checkApiKeySelection().then(setApiKeyVerified);
    } else {
      setApiKeyVerified(true);
    }
  }, [modelType]);

  useEffect(() => {
    if (uploadedImage) {
      const updatePreview = async () => {
        const res = await processImage(uploadedImage, rotation, brightness);
        setProcessedPreview(res);
      };
      updatePreview();
    }
  }, [uploadedImage, rotation, brightness]);

  const handleStepChange = (newStep: AppStep) => {
    playTransition();
    setStep(newStep);
  };

  const handleImageSelected = (base64: string) => {
    playClick();
    setUploadedImage(base64);
    handleStepChange(AppStep.CONFIG);
    setRotation(0);
    setBrightness(100);
    setAutoAnalysis("");
    setCustomPrompt("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    setRotation(prev => (prev + 90) % 360);
  };

  const startMagicScan = () => {
    playClick();
    if (modelType === ModelType.PRO && !apiKeyVerified) {
       promptApiKeySelection().then(() => setApiKeyVerified(true));
       return;
    }
    setShowMagicScan(true);
  };

  const handleScanComplete = (result: AnalysisResult) => {
    playSuccess();
    setShowMagicScan(false);
    setAutoAnalysis(result.description);
    if (!customPrompt) {
      setCustomPrompt(`Features: ${result.tags.join(', ')}.`);
    } else {
      setCustomPrompt(prev => `${prev} (Features: ${result.tags.join(', ')})`);
    }
  };

  const handleRandomize = () => {
    playSuccess(); // Tinh! sound
    
    // Random Style
    const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)];
    setSelectedStyleId(randomStyle.id);
    
    // Random Background
    const randomBg = BACKGROUND_OPTIONS[Math.floor(Math.random() * BACKGROUND_OPTIONS.length)];
    setSelectedBackground(randomBg.id);
    
    // Random Color
    const randomColor = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    setSelectedColorPalette(randomColor.id);
    
    // Random Filter (30% chance each)
    const randomFilters = QUICK_FILTERS.filter(() => Math.random() > 0.7).map(f => f.id);
    setActiveFilters(randomFilters);
    
    // Visual feedback
    triggerConfetti(true);
  };

  const saveToHistory = (imageUrl: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      url: imageUrl,
      timestamp: Date.now()
    };
    
    // Keep max 6 items
    const updatedHistory = [newItem, ...history].slice(0, 6);
    setHistory(updatedHistory);
    
    try {
      localStorage.setItem('chibiHistory', JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn("Storage full, cannot save history");
    }
  };

  const handleDeleteHistory = (id: string) => {
    playClick();
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('chibiHistory', JSON.stringify(updatedHistory));
  };

  const handleGenerate = async () => {
    playClick();
    if (!processedPreview) return;

    if (modelType === ModelType.PRO && !apiKeyVerified) {
      try {
        await promptApiKeySelection();
        setApiKeyVerified(true);
      } catch (e) {
        setError("Vui lòng chọn API Key để sử dụng chế độ Pro.");
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    handleStepChange(AppStep.GENERATING);

    try {
      const style = STYLES.find(s => s.id === selectedStyleId) || STYLES[0];
      const result = await generateChibiImage({
        imageBase64: processedPreview,
        prompt: `Turn this photo into a chibi character. ${style.promptAddon}. ${autoAnalysis ? `User description: ${autoAnalysis}` : ''}`,
        customPrompt: customPrompt,
        background: selectedBackground,
        colorPalette: selectedColorPalette,
        activeFilters: activeFilters,
        model: modelType,
        size: imageSize,
        aspectRatio: aspectRatio,
        useThinking: isThinkingMode
      });

      setGeneratedImage(result);
      saveToHistory(result);
      handleStepChange(AppStep.RESULT);
      playSuccess();
      triggerConfetti();
    } catch (err: any) {
      const errorMessage = err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
      setError(errorMessage);
      handleStepChange(AppStep.CONFIG);
      
      // Auto-open key selection if we suspect missing key environment
      if (errorMessage.includes("API Key") || errorMessage.includes("API_KEY")) {
         try {
           await promptApiKeySelection();
         } catch (_) {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicEdit = async () => {
    playClick();
    if (!generatedImage || !editPrompt.trim()) return;
    setIsEditing(true);
    setError(null);
    try {
      const result = await editGeneratedImage(generatedImage, editPrompt);
      setGeneratedImage(result);
      saveToHistory(result);
      setEditPrompt("");
      playSuccess();
      triggerConfetti();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  const triggerConfetti = (short = false) => {
    const duration = short ? 500 : 2000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f43f5e', '#a855f7', '#3b82f6']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f43f5e', '#a855f7', '#3b82f6']
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  const handleReset = () => {
    playClick();
    setUploadedImage(null);
    setGeneratedImage(null);
    setProcessedPreview(null);
    handleStepChange(AppStep.UPLOAD);
    setError(null);
    setCustomPrompt("");
    setAutoAnalysis("");
    setRotation(0);
    setBrightness(100);
    setActiveFilters([]);
    setSelectedBackground('simple');
    setSelectedColorPalette('default');
  };

  const handleChangeImage = () => {
    playClick();
    setUploadedImage(null);
    setProcessedPreview(null);
    handleStepChange(AppStep.UPLOAD);
    setError(null);
    setRotation(0);
    setBrightness(100);
    setAutoAnalysis("");
  };
  
  const handleHistorySelect = (url: string) => {
    playClick();
    setGeneratedImage(url);
    handleStepChange(AppStep.RESULT);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = async () => {
    playClick();
    if (!generatedImage) return;

    try {
      // Create a Blob from base64
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], `chibi-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Chibi Studio',
          text: 'Xem ảnh Chibi mình vừa tạo này! ✨',
          files: [file],
        });
      } else {
        // Fallback: Copy to clipboard
        try {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          alert("Đã copy ảnh vào bộ nhớ tạm! 📋");
        } catch (err) {
           alert("Trình duyệt chưa hỗ trợ chia sẻ trực tiếp. Hãy tải ảnh về nhé!");
        }
      }
    } catch (error) {
      console.error("Share failed", error);
    }
  };

  const handleDownload = () => {
    playClick();
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `chibi-studio-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Intro Animation
  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <div className="min-h-screen pb-12 flex flex-col items-center relative transition-colors duration-300 font-sans">
      <Background isDarkMode={isDarkMode} />
      <HelpModal isOpen={showHelp} onClose={handleCloseHelp} />

      {/* Header */}
      <header className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3 px-6 sticky top-0 z-50">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-purple-600 tracking-tight drop-shadow-sm">Chibi Studio</h1>
          </div>
          <div className="flex items-center gap-2">
             <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={soundEnabled ? "Mute" : "Unmute"}
             >
                {soundEnabled ? '🔊' : '🔇'}
             </button>
             <button
              onClick={() => setShowHelp(true)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Help"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 dark:text-slate-200"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
             </button>
             <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-xl px-6 mt-8 flex-grow flex flex-col z-10">
        
        {step === AppStep.UPLOAD && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 space-y-4"
          >
            <div className="w-40 h-40 mx-auto -mb-4">
              <RemoteLottie 
                 // Valid JSON for a cute cat
                 src="https://lottie.host/80a08e16-1f6b-4e6f-9694-8178a9c2c623/M1k9Q8s7J3.json"
                 fallbackEmoji="😺"
                 loop={true}
                 autoplay={true}
                 style={{ width: 160, height: 160 }}
              />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight drop-shadow-sm">
              Biến ảnh của bạn thành <br/>
              <span className="text-rose-500">kiệt tác Chibi!</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">
              Upload ảnh, chọn style và để AI làm phép ✨
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Upload */}
          {step === AppStep.UPLOAD && (
            <motion.div
              key="upload"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className="w-full"
            >
              <ImageUploader onImageSelected={handleImageSelected} />
              <HistoryBar 
                history={history} 
                onSelect={handleHistorySelect} 
                onDelete={handleDeleteHistory}
              />
            </motion.div>
          )}

          {/* Step 2: Config */}
          {step === AppStep.CONFIG && processedPreview && (
            <motion.div
              key="config"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className="space-y-8 pb-10"
            >
              <div className="flex flex-col items-center justify-center relative">
                {showMagicScan && (
                  <MagicScanner 
                    imageBase64={processedPreview} 
                    onAnalysisComplete={handleScanComplete}
                    onClose={() => setShowMagicScan(false)}
                  />
                )}

                <div className="relative group transition-transform hover:scale-[1.02] duration-300">
                   <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center">
                    <img 
                      src={processedPreview} 
                      alt="Preview" 
                      className="max-w-full max-h-full object-contain"
                    />
                    {autoAnalysis && (
                       <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] p-2 rounded-lg text-center animate-fade-in">
                          ✨ Đã quét AI
                       </div>
                    )}
                  </div>
                  <button 
                    onClick={handleChangeImage}
                    className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 p-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-600 hover:text-rose-500 transition-all hover:rotate-12 z-20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
                      <path fillRule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/>
                    </svg>
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startMagicScan}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-bold shadow-lg shadow-cyan-500/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12V7a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5h-5"/><path d="m5 17 6.3-7.7A2 2 0 0 1 14 9l6 4.3"/><path d="M5 21v-4"/></svg>
                  Magic Scan
                </motion.button>

                <div className="mt-4 p-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 w-full max-w-xs flex items-center justify-between gap-4">
                    <button 
                      onClick={handleRotate}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"/></svg>
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                        <span>Độ sáng</span>
                        <span>{brightness}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={brightness} 
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                    </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                     <span className="bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                     Chọn phong cách
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRandomize}
                    className="flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full shadow-md hover:shadow-lg"
                  >
                    🎲 Gacha (Random)
                  </motion.button>
                </div>
                <StyleSelector 
                  selectedStyleId={selectedStyleId} 
                  onSelect={(id) => { playClick(); setSelectedStyleId(id); }}
                  customPrompt={customPrompt}
                  onCustomPromptChange={setCustomPrompt}
                />
              </div>

              {/* Quick Filters, Background & Color */}
              <QuickFilters 
                activeFilters={activeFilters}
                onToggleFilter={toggleFilter}
                selectedBackground={selectedBackground}
                onSelectBackground={(id) => { playClick(); setSelectedBackground(id); }}
                selectedColorPalette={selectedColorPalette}
                onSelectColorPalette={(id) => { playClick(); setSelectedColorPalette(id); }}
              />

              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                  <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                  Cấu hình
                </h3>
                <QualityConfig 
                  modelType={modelType}
                  aspectRatio={aspectRatio}
                  onModelChange={(m) => { playClick(); setModelType(m); }}
                  onAspectRatioChange={(r) => { playClick(); setAspectRatio(r); }}
                />
                
                {modelType === ModelType.PRO && (
                  <div className="mt-4 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                        🧠 Masterpiece Mode
                      </div>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">AI suy nghĩ sâu hơn để tạo chi tiết cực đỉnh.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={isThinkingMode} onChange={(e) => { playClick(); setIsThinkingMode(e.target.checked); }} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                )}
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800"
                >
                  🚨 {error}
                </motion.div>
              )}

              <Button 
                fullWidth 
                onClick={handleGenerate}
                className="py-4 text-lg shadow-xl shadow-rose-500/20"
              >
                {modelType === ModelType.PRO && !apiKeyVerified 
                  ? "🔑 Kết nối API & Tạo ảnh" 
                  : "✨ Tạo ảnh Chibi ngay"}
              </Button>
            </motion.div>
          )}

          {/* Step 3: Loading */}
          {step === AppStep.GENERATING && (
            <motion.div
              key="generating"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className="flex flex-col items-center justify-center py-20 text-center space-y-8"
            >
              <div className="w-64 h-64 flex items-center justify-center">
                 <RemoteLottie 
                   // Valid JSON for a painting artist
                   src="https://lottie.host/80a08e16-1f6b-4e6f-9694-8178a9c2c623/M1k9Q8s7J3.json"
                   fallbackEmoji="🎨"
                   loop={true}
                   autoplay={true}
                   style={{ width: 250, height: 250 }}
                 />
              </div>
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 max-w-sm mx-auto w-full">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-purple-600 mb-2">
                  AI đang sáng tạo...
                </h3>
                
                <div className="h-8 relative overflow-hidden">
                   <AnimatePresence mode="wait">
                      <motion.p 
                        key={loadingMessageIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="text-slate-600 dark:text-slate-300 font-medium text-sm absolute inset-0 flex items-center justify-center"
                      >
                         {LOADING_MESSAGES[loadingMessageIndex]}
                      </motion.p>
                   </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Result */}
          {step === AppStep.RESULT && generatedImage && (
            <motion.div
              key="result"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className="space-y-6 text-center pb-20"
            >
               <div className="inline-block relative group w-full">
                  {processedPreview && (
                    <ImageComparison 
                       originalImage={processedPreview}
                       generatedImage={generatedImage}
                       isEditing={isEditing}
                    />
                  )}
                  
                  {/* Success Animation */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 pointer-events-none z-30">
                     <RemoteLottie 
                        src="https://lottie.host/c571736b-967b-402f-b4bd-70b74051010c/pP9mU7f5Yd.json"
                        loop={false}
                        autoplay={true}
                     />
                  </div>

                  <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12 z-20">
                     Mới ra lò! 🔥
                  </div>
               </div>
               
               <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white drop-shadow-sm">Tuyệt phẩm! 😍</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Bạn có thích phiên bản này không?</p>
               </div>

               <div className="max-w-sm mx-auto bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Đổi màu tóc sang xanh..." 
                    className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none text-slate-800 dark:text-white"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    disabled={isEditing}
                  />
                  <button 
                    onClick={handleMagicEdit}
                    disabled={!editPrompt.trim() || isEditing}
                    className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                  </button>
               </div>

               <div className="grid grid-cols-3 gap-2 pt-4">
                  <Button variant="secondary" onClick={() => { playClick(); setStep(AppStep.CONFIG); }} className="text-xs px-2">
                    <span className="flex flex-col items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                      Thử lại
                    </span>
                  </Button>
                  <Button variant="secondary" onClick={handleShare} className="text-xs px-2">
                     <span className="flex flex-col items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                        Chia sẻ
                     </span>
                  </Button>
                  <Button onClick={handleDownload} className="text-xs px-2">
                    <span className="flex flex-col items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Lưu ảnh
                    </span>
                  </Button>
               </div>
               
               <HistoryBar 
                history={history} 
                onSelect={handleHistorySelect} 
                onDelete={handleDeleteHistory}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center text-slate-500 dark:text-slate-400 text-xs py-6 mt-auto z-10 relative">
        <p className="font-semibold opacity-80 flex items-center justify-center gap-2">
          Powered by MinL 
          <a 
            href="https://www.facebook.com/Nguyen.Minh.Long.160403" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-blue-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.66-2.797 3.54v1.274h5.406l-1.359 3.667h-4.047v7.98c7.749-.971 13.677-7.292 13.766-15.068C22.259 3.933 17.595-.126 11.922 0 5.688.175.666 5.444.666 11.687c0 7.776 5.918 14.097 13.666 15.068l-5.231-3.064z"/></svg>
          </a>
        </p>
      </footer>
    </div>
  );
}