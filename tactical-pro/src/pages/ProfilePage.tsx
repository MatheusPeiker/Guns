import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, User as UserIcon, Phone, Save, Mail, AlertCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    async function getProfile() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', user?.id)
          .single();

        if (error) {
          console.warn('Profile sync delay or missing profile:', error);
          return;
        }

        if (data) {
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
        }
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [user, navigate]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        phone,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Dados operacionais atualizados com sucesso.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao sincronizar dados.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF00]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">Painel de Controle</h1>
            <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">Gerencie sua credencial de operador</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            Sair do Sistema
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#00FF00]/10 border-[#00FF00]/30 text-[#00FF00]'}`}>
              <AlertCircle className="w-5 h-5" />
              <p className="font-bold text-sm tracking-wide">{message.text}</p>
            </div>
          )}

          <form onSubmit={updateProfile} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Email Vinculado</label>
                  <div className="flex items-center bg-black/50 border border-white/5 rounded-xl px-4 py-3 opacity-70 cursor-not-allowed">
                    <Mail className="w-5 h-5 text-slate-500 mr-3" />
                    <span className="text-slate-300">{user?.email}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-mono">Credencial primária imutável</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Nome do Operador</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-[#050505] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 transition-all font-bold"
                      placeholder="Identificação completa"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Comunicação Tática (Telefone)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-[#050505] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 transition-all font-mono"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <div className="bg-black/40 border border-[#00FF00]/20 rounded-2xl p-6 text-sm mb-6 flex-1">
                  <h4 className="text-[#00FF00] font-bold uppercase mb-4 tracking-wider flex items-center gap-2">
                    <Shield className="w-5 h-5" /> 
                    Nível de Acesso
                  </h4>
                  <ul className="space-y-3 text-slate-400 font-mono text-xs">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00FF00]" /> Visualização de inventário Classe 1</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00FF00]" /> Compras em território nacional</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00FF00]" /> Alertas prioritários acionados</li>
                  </ul>
                </div>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold bg-white text-black hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50 uppercase tracking-widest"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Sincronizando...' : 'Gravar Alterações'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
