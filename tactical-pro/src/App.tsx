import React, { useState, useEffect, useRef } from 'react';

// Detect touch device at runtime (works in the browser)
const isTouchDevice = () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
import { 
  Shield, 
  Share2,
  Instagram,
  Youtube,
  User as UserIcon,
  ShoppingCart
} from 'lucide-react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { Routes, Route, Link } from 'react-router-dom';

import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AgeGateModal from './components/AgeGateModal';
import CartSidebar from './components/CartSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';

/**
 * Componente Crosshair (Mira HUD)
 * Cria um efeito visual tecnológico que segue o mouse e interage com elementos da página.
 */
const Crosshair = () => {
  // Don't render on touch devices at all
  if (isTouchDevice()) return null;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Configuração de mola para movimento suave (smooth follow)
  const springConfig = { damping: 25, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  const [isHovering, setIsHovering] = useState(false);
  const [targetName, setTargetName] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, img, input, [role="button"]');
      setIsHovering(!!isInteractive);
      
      if (isInteractive) {
        let name = isInteractive.getAttribute('aria-label') || isInteractive.getAttribute('title') || isInteractive.textContent?.trim();
        
        if (!name) {
          if (isInteractive.tagName.toLowerCase() === 'img') {
             name = (isInteractive as HTMLImageElement).alt || 'IMAGE';
          } else if (isInteractive.tagName.toLowerCase() === 'input') {
             name = (isInteractive as HTMLInputElement).placeholder || 'INPUT';
          } else {
             name = isInteractive.tagName.toLowerCase();
          }
        }
        
        if (name && name.length > 20) {
          name = name.substring(0, 17) + '...';
        }
        setTargetName(name);
      } else {
        setTargetName(null);
      }
    };

    const handleScroll = () => {
      setIsScrolling(true);
      setIsVisible(true);
      
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      
      // Efeito de desaparecer após parar de rolar
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
        // Mantém visível se o mouse estiver se movendo, mas aqui simulamos o fade out do scroll
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mouseX, mouseY, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center hidden md:flex"
          style={{
            x: smoothX,
            y: smoothY,
            translateX: '-50%',
            translateY: '-50%',
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: isScrolling ? 0.8 : 1, 
            scale: isHovering ? 1.5 : 1,
            color: isHovering ? '#00FF00' : '#FFFFFF'
          }}
          exit={{ opacity: 0, scale: 0.5 }}
        >
          {/* Círculo Central */}
          <motion.div 
            className="absolute w-2 h-2 bg-current rounded-full"
            animate={{ scale: isHovering ? [1, 1.5, 1] : 1 }}
            transition={{ repeat: isHovering ? Infinity : 0, duration: 1 }}
          />
          
          {/* Linhas da Mira */}
          <div className="absolute w-10 h-10 border border-current rounded-full opacity-20" />
          
          {/* Retículos Externos */}
          {[0, 90, 180, 270].map((angle) => (
            <motion.div
              key={angle}
              className="absolute w-4 h-[1px] bg-current"
              style={{
                rotate: angle,
                transformOrigin: 'center',
                translateY: angle === 0 ? -15 : angle === 180 ? 15 : 0,
                translateX: angle === 90 ? 15 : angle === 270 ? -15 : 0,
              }}
              animate={{ 
                translateY: angle === 0 ? (isHovering ? -20 : -15) : angle === 180 ? (isHovering ? 20 : 15) : 0,
                translateX: angle === 90 ? (isHovering ? 20 : 15) : angle === 270 ? (isHovering ? -20 : -15) : 0,
              }}
            />
          ))}

          {/* Texto de HUD Minimalista */}
          {isHovering && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 30 }}
              className="absolute left-full ml-4 text-[10px] font-mono whitespace-nowrap uppercase tracking-tighter"
            >
              <div className="text-[#00FF00]">Target Locked</div>
              <div className="opacity-50">TARGET: {targetName || 'UNKNOWN'}</div>
              <div className="opacity-50">DIST: 1m</div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const { user } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();

  const isTouch = isTouchDevice();

  return (
    <div className={`min-h-screen bg-[#050505] text-white font-sans selection:bg-[#2e3e2e]/30 cursor-auto md:cursor-none`}>
      <AgeGateModal />
      <Crosshair />
      <CartSidebar />
      
      {/* Global Header */}
      <header className="fixed top-0 left-0 right-0 z-[9000] p-6 flex justify-between items-center pointer-events-none">
        <Link to="/" className="flex items-center gap-2 text-white pointer-events-auto mix-blend-difference group">
          <Shield className="w-8 h-8 text-[#00FF00] group-hover:scale-110 transition-transform" />
          <h1 className="text-xl font-bold tracking-tight hidden sm:block uppercase">Tactical Pro</h1>
        </Link>
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link 
            to={user ? "/perfil" : "/auth"} 
            className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors tooltip relative group"
            title="Acesso Tático"
          >
            <UserIcon className="w-5 h-5 text-white group-hover:text-[#00FF00] transition-colors" />
            <span className="absolute -bottom-8 bg-black border border-white/10 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {user ? 'Painel de Operador' : 'Alistamento'}
            </span>
          </Link>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative group"
            title="Inventário"
          >
            <ShoppingCart className="w-5 h-5 text-white group-hover:text-[#00FF00] transition-colors" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#00FF00] text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {itemCount}
              </span>
            )}
            <span className="absolute -bottom-8 bg-black border border-white/10 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Carrinho
            </span>
          </button>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route path="/admin/pedidos" element={<AdminPage />} />
      </Routes>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 text-white mb-6">
                <Shield className="w-8 h-8" />
                <h1 className="text-xl font-bold tracking-tight text-white">Tactical Pro</h1>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Referência nacional em equipamentos táticos de alta performance. Desenvolvido para quem não aceita falhas.
              </p>
            </div>
            
            <div>
              <h5 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Suporte</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                {['Rastreio de Pedido', 'Garantia Lifetime', 'Trocas e Devoluções', 'Contato Direto'].map((link) => (
                  <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Institucional</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                {['Sobre Nós', 'Blog Operacional', 'Termos de Uso', 'Privacidade'].map((link) => (
                  <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Social</h5>
              <div className="flex gap-4">
                {[Share2, Instagram, Youtube].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#2e3e2e] transition-colors group">
                    <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-[#2e3e2e]/5 text-center text-xs text-slate-600">
            © 2024 Tactical Pro Professional Equipment. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
