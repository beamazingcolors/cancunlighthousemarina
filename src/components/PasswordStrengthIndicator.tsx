import React from 'react';
import { Check, X, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  isEn?: boolean;
}

export interface PasswordCriteria {
  minLength: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  score: number;
  label: string;
  colorClass: string;
  textColorClass: string;
  isStrong: boolean;
}

export function calculatePasswordStrength(password: string, isEn = false): PasswordCriteria {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  let score = 0;
  if (minLength) score++;
  if (hasUpper) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let label = isEn ? 'Very Weak' : 'Muy Débil';
  let colorClass = 'bg-rose-500';
  let textColorClass = 'text-rose-400';

  if (!password) {
    label = isEn ? 'Enter password' : 'Sin contraseña';
    colorClass = 'bg-slate-700';
    textColorClass = 'text-slate-400';
  } else if (score === 1) {
    label = isEn ? 'Weak' : 'Débil';
    colorClass = 'bg-rose-500';
    textColorClass = 'text-rose-400';
  } else if (score === 2) {
    label = isEn ? 'Moderate' : 'Media';
    colorClass = 'bg-amber-500';
    textColorClass = 'text-amber-400';
  } else if (score === 3) {
    label = isEn ? 'Good' : 'Buena';
    colorClass = 'bg-sky-500';
    textColorClass = 'text-sky-400';
  } else if (score === 4) {
    label = isEn ? 'Strong & Secure' : 'Fuerte y Segura';
    colorClass = 'bg-emerald-500';
    textColorClass = 'text-emerald-400';
  }

  return {
    minLength,
    hasUpper,
    hasNumber,
    hasSpecial,
    score,
    label,
    colorClass,
    textColorClass,
    isStrong: score === 4
  };
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  isEn = false
}) => {
  const criteria = calculatePasswordStrength(password, isEn);

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 transition-all duration-300">
      {/* Top Header with Visual Score & Label */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          {criteria.isStrong ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : criteria.score >= 2 ? (
            <Shield className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span>{isEn ? 'Password Strength:' : 'Fortaleza de Contraseña:'}</span>
        </div>
        <span className={`font-bold tracking-wide text-[11px] uppercase ${criteria.textColorClass}`}>
          {criteria.label}
        </span>
      </div>

      {/* 4-Step Color Bar Indicator */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => {
          const isActive = criteria.score >= step;
          return (
            <div
              key={step}
              className={`h-full rounded-full transition-all duration-300 ${
                isActive ? criteria.colorClass : 'bg-slate-700/60'
              }`}
            />
          );
        })}
      </div>

      {/* Requirement Criteria Chips */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
        {/* Min 8 chars */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
            criteria.minLength
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          {criteria.minLength ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-slate-500 shrink-0" />}
          <span className="truncate">{isEn ? '8+ Characters' : 'Mín. 8 caracteres'}</span>
        </div>

        {/* Uppercase */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
            criteria.hasUpper
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          {criteria.hasUpper ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-slate-500 shrink-0" />}
          <span className="truncate">{isEn ? 'Uppercase (A-Z)' : 'Mayúsculas (A-Z)'}</span>
        </div>

        {/* Numbers */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
            criteria.hasNumber
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          {criteria.hasNumber ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-slate-500 shrink-0" />}
          <span className="truncate">{isEn ? 'Numbers (0-9)' : 'Números (0-9)'}</span>
        </div>

        {/* Special characters */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
            criteria.hasSpecial
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          {criteria.hasSpecial ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-slate-500 shrink-0" />}
          <span className="truncate">{isEn ? 'Special (@$#%...)' : 'Especiales (@$#%...)'}</span>
        </div>
      </div>
    </div>
  );
};
