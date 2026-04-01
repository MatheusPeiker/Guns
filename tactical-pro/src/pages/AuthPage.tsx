import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Shield, Lock, Mail, ArrowRight, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/perfil');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        alert('Confira seu email para validar o acesso da Base.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro durante a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00FF00]/5 rounded-[100%] blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-[#0a0a0a] border border-white/10 p-8 sm:p-10 rounded-2xl shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#00FF00]" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-white mb-2 tracking-tight uppercase">
            {isLogin ? 'Acesso Restrito' : 'Alistamento'}
          </h2>
          <p className="text-center text-slate-400 mb-8 font-mono text-sm uppercase tracking-widest">
            {isLogin ? 'Entre na sua base operacional' : 'Registre seus dados de operador'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Nome de Operador</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-[#050505] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 focus:border-transparent transition-all"
                    placeholder="João Silva"
                  />
                </div>
              </div>
            )}

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
              <label className="block text-sm font-bold text-slate-300 mb-2">Código de Segurança (Senha)</label>
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
              {loading ? 'Processando credenciais...' : (isLogin ? 'Entrar no Sistema' : 'Confirmar Alistamento')}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              {isLogin ? 'Não possui acesso à base?' : 'Já é um operador registrado?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-bold text-white hover:text-[#00FF00] transition-colors"
              >
                {isLogin ? 'Alistar-se agora' : 'Acessar Terminal'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
