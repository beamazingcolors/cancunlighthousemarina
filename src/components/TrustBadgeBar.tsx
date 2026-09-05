import React from 'react';
import { ShieldCheck, Lock, Anchor, Award, CheckCircle } from 'lucide-react';

interface TrustBadgeBarProps {
  onOpenCertificates: () => void;
}

export const TrustBadgeBar: React.FC<TrustBadgeBarProps> = ({ onOpenCertificates }) => {
  return (
    <div className="w-full bg-sky-100/50 dark:bg-[#061122] border-y border-sky-200/70 dark:border-[#102540] py-2.5 px-4 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-700 dark:text-sky-100/90">
          <ShieldCheck className="w-4 h-4 text-[#00A3E0] shrink-0" />
          <span className="font-semibold text-[#002147] dark:text-[#7cd1ff]">
            Seguridad & Cumplimiento Marítimo Oficial:
          </span>
          <span className="hidden lg:inline text-slate-600 dark:text-sky-200/60">
            Protocolos auditados para operaciones turísticas de alta gama.
          </span>
        </div>

        <div className="flex items-center flex-wrap justify-center gap-2 sm:gap-3">
          <div className="flex items-center space-x-1.5 bg-white dark:bg-[#091b36] px-2.5 py-1 rounded-md border border-sky-200 dark:border-[#183660] text-slate-700 dark:text-sky-100 text-[11px] shadow-2xs">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span className="font-medium">SSL 256-Bit SHA-256</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-white dark:bg-[#091b36] px-2.5 py-1 rounded-md border border-sky-200 dark:border-[#183660] text-slate-700 dark:text-sky-100 text-[11px] shadow-2xs">
            <Anchor className="w-3 h-3 text-cyan-500" />
            <span className="font-medium">Norma SCT Marina</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-white dark:bg-[#091b36] px-2.5 py-1 rounded-md border border-sky-200 dark:border-[#183660] text-slate-700 dark:text-sky-100 text-[11px] shadow-2xs">
            <Award className="w-3 h-3 text-sky-500" />
            <span className="font-medium">Safe Harbor 2026</span>
          </div>

          <button
            onClick={onOpenCertificates}
            className="flex items-center space-x-1 text-[#008ec4] dark:text-[#38bdf8] hover:text-[#002147] dark:hover:text-white font-semibold px-2 py-1 hover:underline cursor-pointer text-[11px] transition-colors"
          >
            <span>Ver Sellos & Certificados →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
