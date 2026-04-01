import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Shield, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type Status = 'loading' | 'success' | 'error';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Verificando suas credenciais...');
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase envia o token via fragment (#access_token=...) ou query (?token_hash=...)
    // O SDK detecta automaticamente via onAuthStateChange quando a URL contém esses parâmetros
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('success');
        setMessage('Email confirmado! Bem-vindo à base operacional.');
        setTimeout(() => navigate('/perfil'), 2500);
      } else if (event === 'PASSWORD_RECOVERY') {
        setStatus('success');
        setMessage('Senha redefinida. Redirecionando...');
        setTimeout(() => navigate('/auth'), 2000);
      }
    });

    // Também tenta processar a URL manualmente caso o listener não dispare
    const processUrl = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

          if (type === 'signup' || type === 'email_change') {
            setStatus('success');
            setMessage('✓ Email confirmado com sucesso! Acesso à base liberado.');
            setTimeout(() => navigate('/perfil'), 2500);
          } else if (type === 'recovery') {
            setStatus('success');
            setMessage('Senha redefinida. Redirecionando para o login...');
            setTimeout(() => navigate('/auth'), 2000);
          }
          return;
        }

        // Supabase v2: token_hash na query string
        const queryParams = new URLSearchParams(window.location.search);
        const tokenHash = queryParams.get('token_hash');
        const confirmType = queryParams.get('type') as any;

        if (tokenHash && confirmType) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: confirmType,
          });

          if (error) throw error;

          setStatus('success');
          setMessage('✓ Email confirmado! Redirecionando para sua base...');
          setTimeout(() => navigate('/perfil'), 2500);
          return;
        }

        // Se não tem nenhum parâmetro reconhecido após 3s, mostra erro
        setTimeout(() => {
          if (status === 'loading') {
            setStatus('error');
            setMessage('Link de confirmação inválido ou expirado. Tente realizar o cadastro novamente.');
          }
        }, 3000);

      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Erro ao confirmar o email. O link pode ter expirado.');
      }
    };

    processUrl();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      {/* Glow de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#00FF00]/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-sm w-full text-center"
      >
        {/* Ícone animado */}
        <div className="flex justify-center mb-8">
          <motion.div
            animate={status === 'loading' ? { rotate: 360 } : { scale: [1, 1.15, 1] }}
            transition={status === 'loading' ? { repeat: Infinity, duration: 1.2, ease: 'linear' } : { duration: 0.4 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
              status === 'loading' ? 'border-[#00FF00]/30 bg-[#00FF00]/5' :
              status === 'success' ? 'border-[#00FF00]/60 bg-[#00FF00]/10' :
              'border-red-500/60 bg-red-500/10'
            }`}
          >
            {status === 'loading' && <Loader2 className="w-9 h-9 text-[#00FF00]" />}
            {status === 'success' && <CheckCircle2 className="w-9 h-9 text-[#00FF00]" />}
            {status === 'error' && <XCircle className="w-9 h-9 text-red-500" />}
          </motion.div>
        </div>

        {/* Logo */}
        <div className="flex justify-center items-center gap-2 mb-6 opacity-50">
          <Shield className="w-5 h-5 text-[#00FF00]" />
          <span className="text-sm font-bold uppercase tracking-widest text-white">Tactical Pro</span>
        </div>

        <h2 className={`text-2xl font-bold uppercase tracking-tight mb-3 ${
          status === 'error' ? 'text-red-400' : 'text-white'
        }`}>
          {status === 'loading' ? 'Verificando Acesso' : status === 'success' ? 'Acesso Liberado!' : 'Link Inválido'}
        </h2>

        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          {message}
        </p>

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-1"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-[#00FF00] rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ delay: i * 0.2, repeat: Infinity, duration: 0.8 }}
              />
            ))}
          </motion.div>
        )}

        {status === 'error' && (
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-3 rounded-xl bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 transition-all text-sm"
          >
            Voltar ao Alistamento
          </button>
        )}
      </motion.div>
    </div>
  );
}
