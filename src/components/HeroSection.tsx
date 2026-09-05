import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  Layers, 
  Search, 
  ArrowUpRight,
  Ship,
  Users,
  Compass,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';
import { ExecutiveMetrics, FilterState } from '../types/marina';
import { formatCurrencyMXN, formatNumber } from '../utils/formatters';
import { OfficialLogoMark } from './OfficialLogo';

interface HeroSectionProps {
  metrics: ExecutiveMetrics;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  availableWeeks: string[];
  activeTab: string;
  onTabChange: (tab: 'dashboard' | 'operations' | 'executive' | 'calculator') => void;
  onOpenCertificates: () => void;
  onExportCSV: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  metrics,
  filters,
  onFilterChange,
  availableWeeks,
  activeTab,
  onTabChange,
  onOpenCertificates,
  onExportCSV
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#002147] via-[#002e62] to-[#001733] text-white p-5 sm:p-8 border border-white/10 shadow-xl">
      {/* Background Animated Dynamic Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft rotating light beam */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00A3E0]/20 rounded-full blur-3xl animate-marine-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#00A3E0]/15 rounded-full blur-3xl animate-marine-pulse" />
        
        {/* Subtle geometric maritime grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#00A3E0_1px,transparent_1px)] [background-size:28px_28px] opacity-10" />

        {/* Ambient SVG Wave Line */}
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-20 opacity-15 animate-marine-wave pointer-events-none"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z"
            fill="url(#waveGradient)"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00A3E0" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Headline & Scope */}
        <div className="space-y-3.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00A3E0]/20 border border-[#00A3E0]/40 text-xs font-semibold text-[#66d2ff]"
            >
              <OfficialLogoMark className="w-4 h-4 text-[#00A3E0]" color="#00A3E0" />
              <span>Portal de Operaciones Marítimas 2026</span>
            </motion.div>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans"
          >
            Cancun Lighthouse Marina
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl"
          >
            Control integral de zarpes, bitácoras de yates de lujo, cálculo exacto de muellaje, comisiones y rentabilidad consolidada en tiempo real.
          </motion.p>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => onTabChange('operations')}
              className="px-4 py-2 bg-[#00A3E0] hover:bg-[#008ec4] active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-[#00A3E0]/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Explorar Operaciones</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onTabChange('executive')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold rounded-xl border border-white/15 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#00A3E0]" />
              <span>Reporte Ejecutivo Semanal</span>
            </button>

            <button
              onClick={onExportCSV}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-white/15 transition flex items-center gap-1.5 cursor-pointer"
              title="Descargar base de datos completa en formato CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Right Highlight Live Stat Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 lg:w-80 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-[#00A3E0] animate-spin" style={{ animationDuration: '16s' }} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Resumen Activo
              </span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#00A3E0] text-white">
              {filters.semana === 'ALL' ? `Año ${new Date().getFullYear()}` : `Sem ${filters.semana}`}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="bg-black/20 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Ingresos Totales</span>
              <span className="text-lg font-black text-white tracking-tight">
                {formatCurrencyMXN(metrics.totalIngresosMXN)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/20 p-2.5 rounded-xl">
                <span className="text-[10px] text-rose-300 block uppercase font-semibold">Costos Directos</span>
                <span className="text-sm font-bold text-rose-400">
                  {formatCurrencyMXN(metrics.totalCostosDirectosMXN)}
                </span>
              </div>
              <div className="bg-black/20 p-2.5 rounded-xl">
                <span className="text-[10px] text-[#66d2ff] block uppercase font-semibold">Utilidad Operativa</span>
                <span className="text-sm font-bold text-[#38bdf8]">
                  {formatCurrencyMXN(metrics.totalUtilidadOperativaMXN)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-300/80 flex items-center justify-between pt-1 border-t border-white/10">
            <span>Margen Operativo:</span>
            <span className="font-bold text-emerald-300">
              {metrics.margenOperativoPromedio.toFixed(1)}%
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
