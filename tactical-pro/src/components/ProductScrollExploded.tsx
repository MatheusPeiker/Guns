import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const TOTAL_FRAMES = 50;

// Simple sequential names: 1.jpg, 2.jpg, ... 50.jpg
const getFrameSrc = (index: number) => `/assets/Entrada/${index + 1}.jpg`;

export default function ProductScrollExploded() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(Array(TOTAL_FRAMES).fill(null));
  const loadedCountRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(-1);

  const [loadedCount, setLoadedCount] = useState(0);
  const isReady = loadedCount >= Math.min(10, TOTAL_FRAMES); // Show once first 10 are loaded

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

  // Draw the current frame onto the canvas — uses cover fitting
  const drawFrame = useCallback((idx: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[idx];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const offsetX = (W - drawW) / 2;
    const offsetY = (H - drawH) / 2;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }, []);

  // Resize canvas to match display pixels (respects devicePixelRatio for crispness)
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Cap DPR at 2 to avoid excessive memory on high-DPR mobile screens
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.offsetWidth * dpr;
    const H = canvas.offsetHeight * dpr;
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
      // Redraw current frame after resize
      drawFrame(Math.round(frameIndex.get()));
    }
  }, [drawFrame, frameIndex]);

  // Load all images — prioritize first 10 for fast first paint
  useEffect(() => {
    const priorityCount = 10;

    const loadImage = (i: number) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = getFrameSrc(i);
      img.onload = () => {
        imagesRef.current[i] = img;
        loadedCountRef.current += 1;
        setLoadedCount(loadedCountRef.current);
        // Draw frame 0 as soon as it's ready
        if (i === 0) drawFrame(0);
      };
      img.onerror = () => {
        loadedCountRef.current += 1;
        setLoadedCount(loadedCountRef.current);
      };
    };

    // Load priority frames first, then the rest
    for (let i = 0; i < priorityCount; i++) loadImage(i);
    // Small delay before loading the rest so priority frames get bandwidth first
    const timer = setTimeout(() => {
      for (let i = priorityCount; i < TOTAL_FRAMES; i++) loadImage(i);
    }, 300);

    return () => clearTimeout(timer);
  }, [drawFrame]);

  // Subscribe to scroll changes and draw frames via rAF
  useEffect(() => {
    const unsubscribe = frameIndex.on('change', (latest) => {
      const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(latest)));
      if (idx === lastFrameRef.current) return;
      lastFrameRef.current = idx;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(idx));
    });

    return () => {
      unsubscribe();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [frameIndex, drawFrame]);

  // Handle resize with debounce so it doesn't hammer on mobile scroll resize
  useEffect(() => {
    resizeCanvas();
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 100);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
    };
  }, [resizeCanvas]);

  // Text animations — smooth crossfade and longer visible time
  const text1Opacity = useTransform(scrollYProgress, [0.0, 0.05, 0.15, 0.25], [0, 1, 1, 0]);
  const text1X = useTransform(scrollYProgress, [0.0, 0.05], ['-8%', '0%']);
  const text2Opacity = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.95], [0, 1, 1, 0]);
  const text2X = useTransform(scrollYProgress, [0.15, 0.25], ['8%', '0%']);

  const loadPercent = Math.round((loadedCount / TOTAL_FRAMES) * 100);

  return (
    <div ref={containerRef} className="relative h-[300vh] sm:h-[350vh] bg-[#050505] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* Loading overlay — shown until first 10 frames ready */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-50 gap-4">
            <div className="w-8 h-8 rounded-full border-t-2 border-slate-500 animate-spin" />
            <p className="font-mono text-sm text-slate-400 uppercase tracking-widest">
              Carregando... {loadPercent}%
            </p>
            <div className="w-48 h-px bg-white/10 overflow-hidden rounded-full">
              <div
                className="h-full bg-[#00FF00] transition-all duration-300"
                style={{ width: `${loadPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Canvas — fills the sticky viewport */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Text overlays with better text contrast */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <motion.div
            style={{ opacity: text1Opacity, x: text1X }}
            className="absolute top-[15%] sm:top-[25%] left-0 w-full px-6 sm:px-0 sm:left-[10%] sm:max-w-sm"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans tracking-tighter text-white font-bold leading-tight" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>
              Acessórios certos fazem a diferença.
            </h2>
          </motion.div>

          <motion.div
            style={{ opacity: text2Opacity, x: text2X }}
            className="absolute bottom-[15%] sm:bottom-[25%] right-0 w-full px-6 sm:px-0 sm:right-[10%] sm:max-w-sm text-right"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans tracking-tighter text-white font-bold leading-tight" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>
              Monte sua configuração ideal.
            </h2>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
