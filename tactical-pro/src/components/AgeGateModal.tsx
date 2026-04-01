import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert } from 'lucide-react';

export default function AgeGateModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check local storage on mount
    const isVerified = localStorage.getItem('age_verified');
    if (isVerified !== 'true') {
      setIsVisible(true);
      // Lock scrolling while modal is active
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleEnter = () => {
    localStorage.setItem('age_verified', 'true');
    setIsVisible(false);
    // Restore scrolling
    document.body.style.overflow = 'auto';
  };

  const handleExit = () => {
    // Redirect to a neutral page
    window.location.href = 'https://www.google.com';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#000000]/90 backdrop-blur-xl p-4 pointer-events-auto"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-white tracking-tight mb-4 uppercase">
              Acesso Restrito
            </h2>
            
            <p className="text-slate-400 mb-10 leading-relaxed font-medium">
              Este site contém conteúdo adulto e venda de equipamentos táticos. Você confirma que é <span className="text-white font-bold">maior de 18 anos</span>?
            </p>
            
            <div className="flex flex-col sm:flex-row w-full gap-4">
              <button 
                onClick={handleExit}
                className="flex-1 py-4 px-6 rounded-xl font-bold text-slate-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
              >
                Sair
              </button>
              <button 
                onClick={handleEnter}
                className="flex-1 py-4 px-6 rounded-xl font-bold bg-white text-black hover:bg-gray-200 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                Entrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
