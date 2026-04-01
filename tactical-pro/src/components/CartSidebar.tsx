import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, MapPin, Loader2, Truck } from 'lucide-react';
import { IMaskInput } from 'react-imask';

interface ShippingOption {
  type: string;
  price: number;
  duration: string;
}

export default function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, itemCount } = useCart();

  const [cep, setCep] = useState('');
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingError, setShippingError] = useState('');

  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const totalWeight = items.reduce((acc, item) => acc + ((item.product?.weight ?? 0.5) * item.quantity), 0);

  const calculateShipping = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setLoadingShipping(true);
    setShippingError('');
    setShippingOptions([]);
    setSelectedShipping(null);

    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: cleanCep, weight: totalWeight })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShippingOptions(data.options);
      setShippingAddress(data.address);
    } catch (err: any) {
      setShippingError(err.message || 'Erro ao calcular frete.');
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleCheckout = async () => {
    const mpItems = items.map(item => ({
      title: item.product?.name || 'Produto',
      price: item.product?.price || 0,
      quantity: item.quantity
    }));

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: mpItems,
          shippingCost: selectedShipping?.price || 0,
          metadata: { shipping_method: selectedShipping?.type, cep }
        })
      });
      const data = await res.json();
      if (data.init_point) {
        window.open(data.init_point, '_blank');
      }
    } catch (err) {
      console.error('Erro no checkout:', err);
    }
  };

  const grandTotal = cartTotal + (selectedShipping?.price || 0);

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
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#0a0a0a] border-l border-white/10 z-[999999] shadow-2xl flex flex-col pt-8"
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
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400 hover:text-white" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <ShoppingCart className="w-16 h-16 mb-4 text-slate-600" />
                  <p className="text-lg font-bold text-slate-300">Base Vazia</p>
                  <p className="text-sm font-mono text-slate-500 mt-2">Nenhum equipamento logado.</p>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 relative group">
                      <div className="w-16 h-16 bg-black rounded-lg overflow-hidden border border-white/10 flex-shrink-0 flex items-center justify-center">
                        <video
                          src={item.product?.image || ''}
                          className="w-full h-full object-cover opacity-60 mix-blend-screen"
                          muted loop playsInline autoPlay
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-sm uppercase">{item.product?.name}</h4>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">Ref: #{item.product_id.split('-')[0]}</p>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-500 transition-colors ml-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-end justify-between mt-2">
                          <div className="flex items-center gap-3 bg-black/50 border border-white/10 rounded-lg p-1">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-white/10 rounded transition-colors text-slate-300">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-white/10 rounded transition-colors text-slate-300">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-bold text-[#00FF00] text-sm">{formatMoney((item.product?.price || 0) * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Shipping Calculator */}
                  <div className="p-4 bg-white/3 border border-white/10 rounded-2xl mt-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#00FF00]" />
                      Calcular Frete
                    </h3>
                    <div className="flex gap-2">
                      <IMaskInput
                        mask="00000-000"
                        value={cep}
                        onAccept={(val) => setCep(val)}
                        placeholder="CEP de destino"
                        className="flex-1 bg-[#050505] border border-white/10 text-white text-sm px-3 py-2.5 rounded-lg placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#00FF00]/30 transition-all"
                      />
                      <button
                        onClick={calculateShipping}
                        disabled={loadingShipping || cep.replace(/\D/g,'').length < 8}
                        className="px-4 py-2.5 bg-[#00FF00]/10 border border-[#00FF00]/30 text-[#00FF00] text-sm rounded-lg hover:bg-[#00FF00]/20 disabled:opacity-40 transition-all font-bold"
                      >
                        {loadingShipping ? <Loader2 className="w-4 h-4 animate-spin" /> : 'OK'}
                      </button>
                    </div>

                    {shippingError && (
                      <p className="text-red-400 text-xs mt-2">{shippingError}</p>
                    )}

                    {shippingAddress && (
                      <p className="text-slate-500 text-xs mt-2 truncate">{shippingAddress}</p>
                    )}

                    {shippingOptions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {shippingOptions.map((opt) => (
                          <button
                            key={opt.type}
                            onClick={() => setSelectedShipping(opt)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-sm ${
                              selectedShipping?.type === opt.type
                                ? 'bg-[#00FF00]/10 border-[#00FF00]/40 text-white'
                                : 'bg-black/30 border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              <div className="text-left">
                                <span className="font-bold">{opt.type}</span>
                                <span className="text-xs text-slate-500 ml-2">{opt.duration}</span>
                              </div>
                            </div>
                            <span className="font-bold text-[#00FF00]">{formatMoney(opt.price)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#050505]">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-white font-bold">{formatMoney(cartTotal)}</span>
                  </div>
                  {selectedShipping && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Frete ({selectedShipping.type})</span>
                      <span className="text-white font-bold">{formatMoney(selectedShipping.price)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-slate-300 uppercase tracking-widest text-sm font-bold">Total</span>
                    <span className="text-2xl font-bold text-white">{formatMoney(grandTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 hover:bg-[#00FF00] hover:text-black hover:shadow-[0_0_30px_rgba(0,255,0,0.3)]"
                >
                  Finalizar com Mercado Pago
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-center mt-3 text-[10px] text-slate-600 font-mono">
                  Pagamento processado com segurança pelo Mercado Pago
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
