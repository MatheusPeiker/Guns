import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Esquerda: Painel de Branding Fixo (Oculto no mobile) */}
      <div className="hidden lg:flex w-5/12 relative bg-[#020202] border-r border-[#00FF00]/10 flex-col justify-between p-12 overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[20%] -left-[20%] w-[500px] h-[500px] bg-[#00FF00]/5 rounded-full blur-[100px]" />
          <div className="absolute -bottom-[20%] -right-[20%] w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white mb-16 inline-flex">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#00FF00]" />
            </div>
            <span className="text-2xl font-bold uppercase tracking-tight">Tactical Pro</span>
          </Link>

          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 tracking-tighter leading-tight drop-shadow-md">
            Forjados para<br /> 
            <span className="text-[#00FF00]">o combate real.</span>
          </h1>
          <p className="text-slate-400 text-lg mb-12 max-w-md">
            Acesse nossa plataforma para suprimentos militares, equipamentos restritos e logística de alta performance.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Material Homologado</h4>
                <p className="text-sm text-slate-500">Garantia vitalícia em equipamentos táticos de linha de frente.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#00FF00]/10 border border-[#00FF00]/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#00FF00]" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Acesso Logístico Exclusivo</h4>
                <p className="text-sm text-slate-500">Descontos táticos e frete aéreo prioritário para membros corporativos.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-8 mt-12">
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
            © 2024 Tactical Pro • Security Level 5
          </p>
        </div>
      </div>

      {/* Direita: Formulário Dinâmico */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 relative overflow-y-auto w-full z-10">
        {/* Mobile Header (Sobe só quando barra lateral não existe) */}
        <div className="lg:hidden w-full max-w-md flex justify-center mb-8">
          <Link to="/" className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-[#00FF00]" />
          </Link>
        </div>

        <motion.div 
          className="w-full max-w-md md:max-w-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}


