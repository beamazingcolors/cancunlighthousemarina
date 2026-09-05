import React from 'react';
import { 
  X, 
  RefreshCw, 
  Download, 
  BookOpen, 
  ShieldCheck, 
  ExternalLink,
  Calendar,
  Sparkles,
  Layers,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FilterState } from '../types/marina';
import { OfficialLogoMark } from './OfficialLogo';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  availableWeeks: string[];
  onRefresh: () => void;
  isLoading: boolean;
  onExportCSV: () => void;
  onOpenGuide: () => void;
  onOpenCertificates: () => void;
  isLive: boolean;
  lastFetched: Date;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  availableWeeks,
  onRefresh,
  isLoading,
  onExportCSV,
  onOpenGuide,
  onOpenCertificates,
  isLive,
  lastFetched
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-xs flex justify-end">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-10 w-full max-w-xs sm:max-w-sm h-full bg-[#001733] text-white border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-y-auto"
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center text-[#002147] shadow">
                <OfficialLogoMark className="w-7 h-7" color="#002147" />
              </div>
              <div>
                <div className="flex items-center gap-1 font-bold text-xs uppercase text-white">
                  <span>CANCUN</span>
                  <span className="text-[#00A3E0]">LIGHTHOUSE</span>
                </div>
                <p className="text-[9px] font-semibold tracking-widest text-sky-200">MARINA</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body Items */}
          <div className="p-4 space-y-5 flex-1">
            {/* Week Selector in Drawer */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00A3E0]" />
                <span>Semana ({new Date().getFullYear()})</span>
              </label>
              <select
                value={filters.semana}
                onChange={(e) => {
                  onFilterChange('semana', e.target.value);
                  onClose();
                }}
                className="w-full bg-[#002147] text-white text-xs font-semibold py-2 px-3 rounded-xl border border-[#00A3E0]/40 focus:ring-2 focus:ring-[#00A3E0] cursor-pointer"
              >
                <option value="ALL">Todas las Semanas {new Date().getFullYear()}</option>
                {availableWeeks.map(w => (
                  <option key={w} value={w}>
                    Semana {w} ({new Date().getFullYear()})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Acciones Rápidas
              </span>

              {/* Refresh */}
              <button
                onClick={() => {
                  onRefresh();
                  onClose();
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center space-x-2.5">
                  <RefreshCw className={`w-4 h-4 text-[#00A3E0] ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Sincronizar Datos</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isLive ? 'Online' : 'Local'}
                </span>
              </button>

              {/* Export CSV */}
              <button
                onClick={() => {
                  onExportCSV();
                  onClose();
                }}
                className="w-full flex items-center space-x-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Exportar Reporte en CSV</span>
              </button>

              {/* Guide */}
              <button
                onClick={() => {
                  onOpenGuide();
                  onClose();
                }}
                className="w-full flex items-center space-x-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Guía de Llenado & Fórmulas</span>
              </button>

              {/* Certificates */}
              <button
                onClick={() => {
                  onOpenCertificates();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Seguridad & Cumplimiento Marítimo Oficial</span>
                </div>
                <span className="text-[10px] text-emerald-400/80 font-mono">
                  SCT • SSL
                </span>
              </button>
            </div>

            {/* External Google Sheet */}
            <div className="pt-2">
              <a
                href="https://docs.google.com/spreadsheets/d/e/2PACX-1vRHr_YZ4y1-Ww6JKAerEWp1jCp07k3SZkiZcYx47A55PRA7dM-0DLzRMeJgplZbAwLDxswE2sVN9L-U/pubhtml"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#00A3E0]/15 hover:bg-[#00A3E0]/25 border border-[#00A3E0]/30 text-xs font-semibold text-[#00A3E0] transition"
              >
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir Google Sheet Público</span>
                </div>
                <span className="text-[10px]">↗</span>
              </a>
            </div>
          </div>

          {/* Drawer Footer info */}
          <div className="p-4 bg-[#001026] border-t border-white/10 text-center text-[10px] text-slate-400">
            <span>Cancun Lighthouse Marina • Sistema Operativo {new Date().getFullYear()}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
