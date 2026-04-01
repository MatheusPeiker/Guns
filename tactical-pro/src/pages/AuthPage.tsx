import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Mail, ArrowRight, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthTypeSelection, AuthType } from '../components/auth/AuthTypeSelection';
import { CustomerForm } from '../components/auth/CustomerForm';
import { RetailerForm } from '../components/auth/RetailerForm';

type Step = 'login' | 'select' | 'customer' | 'retailer';

export default function AuthPage() {
  const [step, setStep] = useState<Step>('login');
  const [selectedType, setSelectedType] = useState<AuthType>(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/perfil');
    } catch (err: any) {
      setError(err.message || 'Erro durante a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'login':
        return (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight uppercase">
                Acesso Restrito
              </h2>
              <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
                Entre na sua base operacional
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Email Tático</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-[#050505] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 focus:border-transparent transition-all"
                    placeholder="operador@base.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Código de Segurança</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-[#050505] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-[#050505] bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50 transition-all uppercase tracking-wider mt-4"
              >
                {loading ? 'Processando...' : 'Entrar no Sistema'}
                {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-white/10">
              <p className="text-sm text-slate-400">
                Não possui acesso à base?
                <button
                  onClick={() => setStep('select')}
                  className="ml-2 font-bold text-white hover:text-[#00FF00] transition-colors"
                >
                  Alistar-se agora
                </button>
              </p>
            </div>
          </motion.div>
        );

      case 'select':
        return (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AuthTypeSelection
              selected={selectedType}
              onSelect={setSelectedType}
              onContinue={() => {
                if (selectedType === 'customer') setStep('customer');
                if (selectedType === 'retailer') setStep('retailer');
              }}
              onToggleLogin={() => setStep('login')}
            />
          </motion.div>
        );

      case 'customer':
        return (
          <motion.div
            key="customer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CustomerForm
              onToggleLogin={() => setStep('login')}
              onSuccess={() => {
                alert('Alistamento concluído. Verifique seu email se o confirm for exigido, ou retorne ao login.');
                setStep('login');
              }}
            />
          </motion.div>
        );

      case 'retailer':
        return (
          <motion.div
            key="retailer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <RetailerForm
              onToggleLogin={() => setStep('login')}
            />
          </motion.div>
        );
    }
  };

  return (
    <AuthLayout>
      <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl relative">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
}
