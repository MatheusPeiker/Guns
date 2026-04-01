import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IMaskInput } from 'react-imask';
import { Shield, Lock, Mail, ArrowRight, User, Phone, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PasswordStrengthBar } from './PasswordStrengthBar';

// Helper de validação básica de CPF
const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  // Regra simplificada para zod, o ideal seria o algoritmo 11 mod
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  return true;
};

const customerSchema = z.object({
  fullName: z.string().min(3, 'Nome de operador deve ter pelo menos 3 letras.'),
  email: z.string().email('Email tático inválido.'),
  cpf: z.string().refine((val) => validateCPF(val), { message: 'Documento CPF inválido.' }),
  phone: z.string().min(14, 'Telefone incompleto.'),
  password: z.string().min(8, 'O código de segurança deve ter pelo menos 8 caracteres.')
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export function CustomerForm({ onToggleLogin, onSuccess }: { onToggleLogin: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    mode: 'onTouched'
  });

  const currentPassword = watch('password', '');

  const onSubmit = async (data: CustomerFormValues) => {
    setLoading(true);
    setServerError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            cpf: data.cpf,
            phone: data.phone,
            user_type: 'customer'
          }
        }
      });

      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      setServerError(err.message || 'Falha na comunicação com a Base.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight uppercase">
          Operador Individual
        </h2>
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
          Insira suas credenciais
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-400">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-500" />
            </div>
            <input
              {...register('fullName')}
              type="text"
              className={`block w-full pl-10 pr-3 py-3 border ${errors.fullName ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-[#00FF00]/50'} rounded-xl bg-[#050505] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              placeholder="Nome do Operador"
            />
          </div>
          {errors.fullName && <p className="text-red-400 text-xs mt-1 ml-1">{errors.fullName.message}</p>}
        </div>

        {/* CPF e Telefone (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-slate-500" />
              </div>
              <Controller
                name="cpf"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <IMaskInput
                    {...field}
                    mask="000.000.000-00"
                    onAccept={(value) => field.onChange(value)}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.cpf ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-[#00FF00]/50'} rounded-xl bg-[#050505] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    placeholder="CPF"
                  />
                )}
              />
            </div>
            {errors.cpf && <p className="text-red-400 text-xs mt-1 ml-1">{errors.cpf.message}</p>}
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
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.phone ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-[#00FF00]/50'} rounded-xl bg-[#050505] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    placeholder="WhatsApp"
                  />
                )}
              />
            </div>
            {errors.phone && <p className="text-red-400 text-xs mt-1 ml-1">{errors.phone.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-500" />
            </div>
            <input
              {...register('email')}
              type="email"
              className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-[#00FF00]/50'} rounded-xl bg-[#050505] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              placeholder="Email Tático"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-500" />
            </div>
            <input
              {...register('password')}
              type="password"
              className={`block w-full pl-10 pr-3 py-3 border ${errors.password ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-[#00FF00]/50'} rounded-xl bg-[#050505] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              placeholder="Código de Segurança"
            />
          </div>
          {errors.password ? (
            <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>
          ) : (
            <PasswordStrengthBar password={currentPassword} />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-[#050505] bg-[#00FF00] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00FF00] disabled:opacity-50 transition-all uppercase tracking-wider mt-6"
        >
          {loading ? 'Processando...' : 'Confirmar Alistamento'}
          {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-white/10">
        <button
          onClick={onToggleLogin}
          type="button"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Voltar e acessar terminal existente
        </button>
      </div>
    </div>
  );
}
