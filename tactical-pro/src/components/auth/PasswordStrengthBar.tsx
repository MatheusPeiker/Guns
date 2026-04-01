import React from 'react';

interface PasswordStrengthBarProps {
  password: string;
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  // 0-4 score
  let score = 0;
  if (password.length > 7) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Visual text and colors
  const stateConfig = [
    { text: 'Aguardando', color: 'bg-slate-700', active: 'bg-slate-500' },     // 0
    { text: 'Fraca', color: 'bg-red-900/40', active: 'bg-red-500' },           // 1
    { text: 'Razoável', color: 'bg-amber-900/40', active: 'bg-amber-500' },    // 2
    { text: 'Boa', color: 'bg-lime-900/40', active: 'bg-lime-500' },           // 3
    { text: 'Forte', color: 'bg-emerald-900/40', active: 'bg-emerald-500' },       // 4
  ];

  const currentConfig = stateConfig[score];

  return (
    <div className="mt-3">
      <div className="flex gap-1.5 h-1.5 mb-1.5">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`flex-1 rounded-full transition-all duration-300 ${
              score >= level ? currentConfig.active : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-500">Força da credencial</span>
        <span className={`font-bold transition-all duration-300 ${score === 4 ? 'text-emerald-400' : score > 2 ? 'text-lime-400' : score > 1 ? 'text-amber-400' : 'text-slate-400'}`}>
          {password.length === 0 ? 'Aguardando' : currentConfig.text}
        </span>
      </div>
    </div>
  );
}
