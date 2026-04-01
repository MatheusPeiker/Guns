import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';

const TOTAL_FRAMES = 23; 
const FRAME_START_INDEX = 4; // Starts from ezgif-frame-004.jpg

export default function ProductScrollExploded() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all images on mount
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
        const frameIndex = FRAME_START_INDEX + i;
        const indexStr = frameIndex.toString().padStart(3, '0');
        const src = `/assets/Entrada/ezgif-frame-${indexStr}.jpg`;

        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === TOTAL_FRAMES) {
            setIsLoading(false);
          }
        };
        // Handle error gracefully so it doesn't hang forever
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === TOTAL_FRAMES) {
            setIsLoading(false);
          }
        };
        loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const currentFrame = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

  const render = () => {
    const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentFrame.get())));
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Always conform canvas drawing buffer to actual screen size to prevent blur
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
       canvas.width = window.innerWidth;
       canvas.height = window.innerHeight;
    }

    const ctx = canvas.getContext('2d');
    if (ctx && images[frameIndex]) {
      // Clear and paint base background
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const img = images[frameIndex];
      // Contain fit
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgRatio > canvasRatio) {
         drawWidth = canvas.width;
         drawHeight = canvas.width / imgRatio;
         offsetX = 0;
         offsetY = (canvas.height - drawHeight) / 2;
      } else {
         drawHeight = canvas.height;
         drawWidth = canvas.height * imgRatio;
         offsetX = (canvas.width - drawWidth) / 2;
         offsetY = 0;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
  };

  useMotionValueEvent(currentFrame, "change", () => {
     if (!isLoading && images.length > 0) {
        render();
     }
  });

  // Render on first load once loading finishes
  useEffect(() => {
    if (!isLoading && images.length > 0) {
       render();
    }
    
    const handleResize = () => {
      render();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoading, images]);

  // Opacity & Transform animations
  const text1Opacity = useTransform(scrollYProgress, [0.10, 0.20, 0.35, 0.45], [0, 1, 1, 0]);
  const text1X = useTransform(scrollYProgress, [0.10, 0.20], ["-10%", "0%"]);

  const text2Opacity = useTransform(scrollYProgress, [0.35, 0.45, 0.80, 0.90], [0, 1, 1, 0]);
  const text2X = useTransform(scrollYProgress, [0.35, 0.45], ["10%", "0%"]);

  return (
    <div ref={containerRef} className="relative h-[200vh] sm:h-[250vh] bg-[#050505] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Loader */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-50 text-white gap-4">
             <div className="w-8 h-8 rounded-full border-t-2 border-slate-500 animate-spin"></div>
             <p className="font-mono text-sm opacity-60 uppercase tracking-widest text-slate-400">Loading module sequence...</p>
          </div>
        )}

        {/* Canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 z-10 w-full h-full object-cover pointer-events-none" 
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* 30% Scroll */}
          <motion.div 
             style={{ opacity: text1Opacity, x: text1X }} 
             className="absolute top-1/2 left-0 -translate-y-1/2 w-full px-6 sm:px-0 sm:left-[10%] sm:max-w-sm"
          >
             <h2 className="text-2xl sm:text-3xl md:text-5xl font-sans tracking-tighter text-white/90 font-bold leading-tight">
               Acessórios certos fazem a diferença.
             </h2>
          </motion.div>

          {/* 60% Scroll */}
          <motion.div 
             style={{ opacity: text2Opacity, x: text2X }} 
             className="absolute top-1/2 right-0 -translate-y-1/2 w-full px-6 sm:px-0 sm:right-[10%] sm:max-w-sm text-right"
          >
             <h2 className="text-2xl sm:text-3xl md:text-5xl font-sans tracking-tighter text-white/90 font-bold leading-tight">
               Monte sua configuração ideal.
             </h2>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
