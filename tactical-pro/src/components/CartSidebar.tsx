import React from 'react';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, itemCount } = useCart();
  const navigate = useNavigate();

  // Utility formatter
  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-[999999] shadow-2xl flex flex-col pt-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-[#00FF00]" />
                <h2 className="text-xl font-bold uppercase tracking-wider text-white">Equipamentos</h2>
                {itemCount > 0 && (
                  <span className="bg-[#00FF00]/20 text-[#00FF00] py-0.5 px-2.5 rounded-full text-xs font-bold ml-2">
                    {itemCount}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400 hover:text-white" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <ShoppingCart className="w-16 h-16 mb-4 text-slate-600" />
                  <p className="text-lg font-bold text-slate-300">Base Vazia</p>
                  <p className="text-sm font-mono text-slate-500 mt-2">Nenhum equipamento logado.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 relative group">
                    <div className="w-20 h-20 bg-black rounded-lg overflow-hidden border border-white/10 flex-shrink-0 relative flex items-center justify-center">
                      <video 
                        src={item.product?.image || ''} 
                        className="w-full h-full object-cover opacity-60 mix-blend-screen"
                        muted loop playsInline
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-sm uppercase">{item.product?.name}</h4>
                          <p className="text-xs text-slate-400 font-mono mt-1">Ref: #{item.product_id.split('-')[0]}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        <div className="flex items-center gap-3 bg-black/50 border border-white/10 rounded-lg p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-slate-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-slate-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-[#00FF00]">
                          {formatMoney((item.product?.price || 0) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#050505] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-400 uppercase tracking-widest text-sm font-bold">Subtotal Tático</span>
                  <span className="text-2xl font-bold text-white tracking-tight">{formatMoney(cartTotal)}</span>
                </div>
                
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 hover:bg-[#00FF00] hover:text-black hover:shadow-[0_0_30px_rgba(0,255,0,0.3)] shadow-[0_0_15px_rgba(0,255,0,0.1)]"
                >
                  Confirmar Aquisição
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="text-center mt-4">
                  <p className="text-[10px] text-slate-500 font-mono">* Taxas de frete aéreo calculadas no checkout.</p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
