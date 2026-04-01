import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Building2, ArrowRight } from 'lucide-react';

export type AuthType = 'customer' | 'retailer' | null;

interface AuthTypeSelectionProps {
  selected: AuthType;
  onSelect: (type: AuthType) => void;
  onContinue: () => void;
  onToggleLogin: () => void;
}

export function AuthTypeSelection({ selected, onSelect, onContinue, onToggleLogin }: AuthTypeSelectionProps) {
  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight uppercase">
          Alistamento
        </h2>
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
          Selecione seu perfil operacional
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Card Cliente */}
        <button
          onClick={() => onSelect('customer')}
          className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border transition-all duration-300 overflow-hidden group ${
            selected === 'customer' 
              ? 'bg-[#00FF00]/5 border-[#00FF00]/50 shadow-[0_0_30px_rgba(0,255,0,0.1)]' 
              : 'bg-[#050505] border-white/10 hover:border-white/20'
          }`}
        >
          {selected === 'customer' && (
            <motion.div layoutId="glow" className="absolute inset-0 bg-gradient-to-b from-[#00FF00]/10 to-transparent opacity-50 pointer-events-none" />
          )}
          
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
            selected === 'customer' ? 'bg-[#00FF00]/20 text-[#00FF00]' : 'bg-white/5 text-slate-400 group-hover:text-white'
          }`}>
            <User className="w-8 h-8" />
          </div>
          
          <h3 className={`text-lg font-bold uppercase tracking-tight mb-2 ${selected === 'customer' ? 'text-white' : 'text-slate-300'}`}>
            Operador Individual
          </h3>
          <p className="text-xs text-slate-500 text-center uppercase tracking-widest">
            (Pessoa Física)
          </p>
        </button>

        {/* Card Lojista */}
        <button
          onClick={() => onSelect('retailer')}
          className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border transition-all duration-300 overflow-hidden group ${
            selected === 'retailer' 
              ? 'bg-amber-500/5 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)]' 
              : 'bg-[#050505] border-white/10 hover:border-white/20'
          }`}
        >
          {selected === 'retailer' && (
            <motion.div layoutId="glow" className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-50 pointer-events-none" />
          )}

          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
            selected === 'retailer' ? 'bg-amber-500/20 text-amber-500' : 'bg-white/5 text-slate-400 group-hover:text-white'
          }`}>
            <Building2 className="w-8 h-8" />
          </div>
          
          <h3 className={`text-lg font-bold uppercase tracking-tight mb-2 ${selected === 'retailer' ? 'text-white' : 'text-slate-300'}`}>
            Credenciamento Tático
          </h3>
          <p className="text-xs text-slate-500 text-center uppercase tracking-widest">
            (Lojista / CNPJ)
          </p>
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.button
          onClick={onContinue}
          disabled={!selected}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full flex items-center justify-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold uppercase tracking-wider transition-all
            ${selected === 'customer' ? 'bg-[#00FF00] text-black hover:brightness-110' : ''}
            ${selected === 'retailer' ? 'bg-amber-500 text-black hover:brightness-110' : ''}
            ${!selected ? 'bg-white/10 text-slate-500 cursor-not-allowed opacity-50' : ''}
          `}
        >
          Continuar
          <ArrowRight className="ml-2 w-4 h-4" />
        </motion.button>
      </AnimatePresence>

      <div className="mt-8 text-center pt-6 border-t border-white/10">
        <p className="text-sm text-slate-400">
          Já é um operador registrado?
          <button
            onClick={onToggleLogin}
            className="ml-2 font-bold text-white hover:text-[#00FF00] transition-colors"
          >
            Acessar Terminal
          </button>
        </p>
      </div>
    </div>
  );
}
