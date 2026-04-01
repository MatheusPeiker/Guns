import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IMaskInput } from 'react-imask';
import { Shield, Lock, Mail, ArrowRight, Building2, User, Phone, XCircle, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PasswordStrengthBar } from './PasswordStrengthBar';

// Helper de validação básica de CNPJ
const validateCNPJ = (cnpj: string) => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  return cleanCNPJ.length === 14;
};

const retailerSchema = z.object({
  cnpj: z.string().refine((val) => validateCNPJ(val), { message: 'Documento CNPJ inválido.' }),
  companyName: z.string().min(3, 'Cnpj não validado ou Razão Social curta.'),
  fantasyName: z.string().min(2, 'Nome Fantasia inválido.'),
  fullName: z.string().min(3, 'Nome do responsável inválido.'),
  email: z.string().email('Email corporativo inválido.'),
  phone: z.string().min(14, 'Telefone incompleto.'),
  password: z.string().min(8, 'O código de segurança deve ter pelo menos 8 caracteres.')
});

type RetailerFormValues = z.infer<typeof retailerSchema>;

export function RetailerForm({ onToggleLogin }: { onToggleLogin: () => void }) {
  const [loading, setLoading] = useState(false);
  const [fetchingCnpj, setFetchingCnpj] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<RetailerFormValues>({
    resolver: zodResolver(retailerSchema),
    mode: 'onTouched'
  });

  const currentPassword = watch('password', '');

  const fetchCnpjData = async (cnpjValue: string) => {
    const cleanCnpj = cnpjValue.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return;

    setFetchingCnpj(true);
    setServerError(null);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!response.ok) throw new Error('Falha ao buscar CNPJ na BrasilAPI');
      const data = await response.json();
      
      setValue('companyName', data.razao_social || '', { shouldValidate: true });
      setValue('fantasyName', data.nome_fantasia || data.razao_social || '', { shouldValidate: true });
    } catch (err) {
      setServerError('CNPJ não encontrado ou indisponível.');
    } finally {
      setFetchingCnpj(false);
    }
  };

  const onSubmit = async (data: RetailerFormValues) => {
    setLoading(true);
    setServerError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            cnpj: data.cnpj,
            company_name: data.companyName,
            fantasy_name: data.fantasyName,
            phone: data.phone,
            user_type: 'retailer',
            status: 'pending_approval' // Retailers start pending
          }
        }
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message || 'Falha na comunicação com a Base.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full text-center py-8">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-amber-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">Requisição Recebida</h2>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8 text-left inline-block max-w-sm">
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            Seu pedido de <strong>Credenciamento Tático (Lojista)</strong> foi enviado para a nossa central de inteligência.
          </p>
          <div className="flex gap-3 mt-4 items-start bg-[#050505] p-3 rounded-lg border border-white/5">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-500/90 font-bold uppercase tracking-widest">
              Aprovação tática pendente.<br/>Prazo estimado: 48h.
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-6">Você será notificado no email cadastrado.</p>
        <button
          onClick={onToggleLogin}
          className="w-full flex items-center justify-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-[#050505] bg-white hover:bg-gray-200 transition-all uppercase tracking-wider"
        >
          Retornar à Base
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight uppercase">
          Credenciamento Tático
        </h2>
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
          Insira dados da sua operação
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-400">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Seção Empresa */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20 pb-2">Dados Jurídicos</h3>
          
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-slate-500" />
              </div>
              <Controller
                name="cnpj"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <IMaskInput
                    {...field}
                    mask="00.000.000/0000-00"
                    onAccept={(value) => field.onChange(value)}
                    onBlur={() => fetchCnpjData(field.value)}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.cnpj ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-amber-500/50'} rounded-xl bg-[#050505] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    placeholder="CNPJ (Auto-completa dados)"
                  />
                )}
              />
              {fetchingCnpj && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
                </div>
              )}
            </div>
            {errors.cnpj && <p className="text-red-400 text-xs mt-1 ml-1">{errors.cnpj.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                {...register('companyName')}
                type="text"
                readOnly
                className="block w-full px-3 py-3 border border-white/5 rounded-xl bg-[#050505]/50 text-slate-400 placeholder-slate-600 focus:outline-none focus:ring-0 transition-all cursor-not-allowed text-sm"
                placeholder="Razão Social"
              />
            </div>
            <div>
              <input
                {...register('fantasyName')}
                type="text"
                className={`block w-full px-3 py-3 border ${errors.fantasyName ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-amber-500/50'} rounded-xl bg-[#050505] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm`}
                placeholder="Nome Fantasia"
              />
            </div>
          </div>
        </div>

        {/* Seção Responsável */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20 pb-2 pt-2">Responsável</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  {...register('fullName')}
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.fullName ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-amber-500/50'} rounded-xl bg-[#050505] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="Nome do Operador"
                />
              </div>
              {errors.fullName && <p className="text-red-400 text-xs mt-1 ml-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-500" />
                </div>
                <Controller
                  name="phone"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <IMaskInput
                      {...field}
                      mask="(00) 00000-0000"
                      onAccept={(value) => field.onChange(value)}
                      className={`block w-full pl-10 pr-3 py-3 border ${errors.phone ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-amber-500/50'} rounded-xl bg-[#050505] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                      placeholder="WhatsApp (Corporativo)"
                    />
                  )}
                />
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1 ml-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                {...register('email')}
                type="email"
                className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-amber-500/50'} rounded-xl bg-[#050505] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                placeholder="Email Tático"
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                {...register('password')}
                type="password"
                className={`block w-full pl-10 pr-3 py-3 border ${errors.password ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-amber-500/50'} rounded-xl bg-[#050505] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                placeholder="Código de Segurança"
              />
            </div>
            {errors.password ? (
              <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>
            ) : (
              <PasswordStrengthBar password={currentPassword} />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || fetchingCnpj}
          className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-[#050505] bg-amber-500 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all uppercase tracking-wider mt-6"
        >
          {loading ? 'Processando Credenciais...' : 'Submeter Credenciamento'}
          {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-white/10">
        <button
          onClick={onToggleLogin}
          type="button"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Voltar e acessar terminal corporativo
        </button>
      </div>
    </div>
  );
}
