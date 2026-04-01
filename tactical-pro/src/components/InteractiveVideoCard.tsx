import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

interface InteractiveVideoCardProps {
  id: number;
  slug?: string;
  name: string;
  description: string;
  videoSrc: string;
  tag?: string;
}

export const InteractiveVideoCard: React.FC<InteractiveVideoCardProps> = ({ 
  name, 
  slug = name.toLowerCase().replace(/\s+/g, '-'),
  description, 
  videoSrc, 
  tag 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart, isLoading } = useCart();

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      // Play the video. Ignore play() promise rejection errors (if any)
      videoRef.current.play().catch(e => console.log('Auto-play prevented', e));
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset to the first frame
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.03, y: -5 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-[#0b0b0b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all flex flex-col group relative"
    >
      {/* Product Highlight / Glow */}
      <div className={`absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-500 pointer-events-none ${isHovered ? 'opacity-100' : ''}`} />

      {/* Media Container */}
      <div className="relative aspect-[4/5] w-full bg-[#000000] overflow-hidden flex items-center justify-center">
        
        {/* The 360 Video Player */}
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-contain mix-blend-screen opacity-90 transition-opacity duration-300 group-hover:opacity-100"
        />

        {tag && (
          <div className="absolute top-4 right-4 bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest z-10 transition-transform group-hover:scale-105">
            {tag}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] to-transparent opacity-40 z-0 pointer-events-none" />

        {/* Action Buttons overlay */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-10">
          <Link to={`/categoria/${slug}`} className="bg-white/10 backdrop-blur-md border border-white/20 text-white p-3 rounded-full hover:bg-white hover:text-black transition-all">
            <Eye className="w-5 h-5" />
          </Link>
          <button 
            disabled={isLoading}
            onClick={(e) => { e.preventDefault(); addToCart(slug); }}
            className="bg-[#00FF00]/20 backdrop-blur-md border border-[#00FF00]/40 text-[#00FF00] p-3 rounded-full hover:bg-[#00FF00] hover:text-black transition-all cursor-pointer disabled:opacity-50"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Category details */}
      <div className="p-6 flex flex-col flex-1 relative z-10">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-bold text-2xl leading-tight text-white tracking-tight uppercase">{name}</h4>
        </div>
        
        <p className="text-sm text-slate-400 mb-6 flex-1 leading-relaxed">
          {description}
        </p>
        
        <Link to={`/categoria/${slug}`} className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          Explorar Equipamentos
        </Link>
      </div>
    </motion.div>
  );
};

export default InteractiveVideoCard;
