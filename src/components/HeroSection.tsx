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
  Download,
  Coins,
  DollarSign,
  Wallet,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'motion/react';
import { ExecutiveMetrics, DetailedFinancialMetrics, FilterState, CurrencyDisplayMode } from '../types/marina';
import { formatCurrencyMXN, formatCurrencyUSD, formatPercent, formatNumber } from '../utils/formatters';
import { OfficialLogoMark } from './OfficialLogo';
import { useLanguage } from '../context/LanguageContext';

interface HeroSectionProps {
  metrics: ExecutiveMetrics;
  detailedMetrics: DetailedFinancialMetrics;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  availableWeeks: string[];
  activeTab: string;
  onTabChange: (tab: 'dashboard' | 'operations' | 'executive' | 'calendar') => void;
  onOpenCertificates: () => void;
  onExportCSV: () => void;
  currencyMode: CurrencyDisplayMode;
  onCurrencyModeChange: (mode: CurrencyDisplayMode) => void;
  onOpenReconciliation?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  metrics,
  detailedMetrics,
  filters,
  onFilterChange,
  availableWeeks,
  activeTab,
  onTabChange,
  onOpenCertificates,
  onExportCSV,
  currencyMode,
  onCurrencyModeChange,
  onOpenReconciliation
}) => {
  const { l, t } = useLanguage();

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
              <span>{l('Portal de Operaciones Marítimas 2026', 'Maritime Operations Portal 2026')}</span>
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
            {t.heroSubtitle}
          </motion.p>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => onTabChange('operations')}
              className="px-4 py-2 bg-[#00A3E0] hover:bg-[#008ec4] active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-[#00A3E0]/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>{l('Explorar Operaciones', 'Explore Operations')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onTabChange('executive')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold rounded-xl border border-white/15 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#00A3E0]" />
              <span>{l('Reporte Ejecutivo Semanal', 'Weekly Executive Report')}</span>
            </button>

            {onOpenReconciliation && (
              <button
                id="btn-hero-reconciliation"
                onClick={onOpenReconciliation}
                className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 active:scale-95 text-xs font-semibold rounded-xl border border-emerald-400/40 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title={l('Comparativa matemática exacta de filas y columnas vs Google Sheet', 'Exact mathematical reconciliation of rows and columns vs Google Sheet')}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>{l('Auditoría Google Sheet', 'Google Sheet Audit')}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-400 text-slate-950 font-bold rounded-full">{l('100% Exacto', '100% Exact')}</span>
              </button>
            )}

            <button
              onClick={onExportCSV}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-white/15 transition flex items-center gap-1.5 cursor-pointer"
              title={l('Descargar base de datos completa en formato CSV', 'Download entire dataset in CSV format')}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{l('Exportar CSV', 'Export CSV')}</span>
            </button>
          </div>
        </div>

        {/* Right Highlight Live Stat Box: Resumen Activo with requested parameters & currency toggles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          id="cuadro-resumen-activo"
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 lg:w-96 shadow-2xl"
        >
          {/* Header of Resumen Activo */}
          <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-[#00A3E0] animate-spin" style={{ animationDuration: '16s' }} />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {l('Resumen Activo', 'Active Summary')}
              </span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#00A3E0] text-white">
              {filters.semana === 'ALL' ? `${l('Año', 'Year')} ${new Date().getFullYear()}` : `${l('Sem', 'Wk')} ${filters.semana}`}
            </span>
          </div>

          {/* Currency Toggle Buttons inside Resumen Activo */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10 text-[11px]">
            <button
              type="button"
              onClick={() => onCurrencyModeChange('all_mxn')}
              className={`flex-1 py-1 px-1.5 rounded-lg font-bold transition text-center cursor-pointer ${
                currencyMode === 'all_mxn'
                  ? 'bg-[#00A3E0] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title={l('Dame todo en pesos: Convierte valores según el tipo de cambio de cada fila', 'All in pesos: Converts values using each row exchange rate')}
            >
              {l('💵 En Pesos', '💵 In Pesos')}
            </button>
            <button
              type="button"
              onClick={() => onCurrencyModeChange('split')}
              className={`flex-1 py-1 px-1.5 rounded-lg font-bold transition text-center cursor-pointer ${
                currencyMode === 'split'
                  ? 'bg-[#00A3E0] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title={l('Dólares y pesos: Desglose en detalle de cuántos USD y cuántos MXN', 'Dollars and pesos: Detailed breakdown of USD and MXN')}
            >
              {l('🔄 USD & MXN', '🔄 USD & MXN')}
            </button>
            <button
              type="button"
              onClick={() => onCurrencyModeChange('usd')}
              className={`flex-1 py-1 px-1.5 rounded-lg font-bold transition text-center cursor-pointer ${
                currencyMode === 'usd'
                  ? 'bg-[#00A3E0] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title={l('Ver todo expresado en Dólares', 'See everything in US Dollars')}
            >
              {l('💲 Solo USD', '💲 USD Only')}
            </button>
          </div>

          {/* Core Parameters Requested: Utilidad Neta & Utilidad de Vendedores */}
          <div className="space-y-2 text-xs">
            {/* 1. Utilidad Neta (Muelle + Over + Casa) */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-300 font-bold uppercase tracking-wider">
                  {l('Utilidad Neta (Muelle + Over + Casa)', 'Net Operating Profit (Dock + Over + House)')}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">{l('Marina', 'Marina')}</span>
              </div>

              {currencyMode === 'all_mxn' && (
                <div className="mt-1">
                  <span className="text-xl font-black text-emerald-300 tracking-tight block">
                    {formatCurrencyMXN(detailedMetrics.totalUtilidadNetaMXN)}
                  </span>
                  <span className="text-[10px] text-emerald-400/80">
                    {l('Muelle', 'Dock')}: {formatCurrencyMXN(detailedMetrics.totalMuelleMXN)} + Over: {formatCurrencyMXN(detailedMetrics.totalOverMXN)} + {l('Casa', 'House')}: {formatCurrencyMXN(detailedMetrics.totalCasaMXN)}
                  </span>
                </div>
              )}

              {currencyMode === 'split' && (
                <div className="mt-1 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{l('Dólares (USD):', 'US Dollars (USD):')}</span>
                    <span className="text-sm font-black text-emerald-300 font-mono">
                      {formatCurrencyUSD(detailedMetrics.usdTotalUtilidadNeta)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{l('Pesos (MXN):', 'Mexican Pesos (MXN):')}</span>
                    <span className="text-sm font-black text-white font-mono">
                      {formatCurrencyMXN(detailedMetrics.mxnTotalUtilidadNeta)}
                    </span>
                  </div>
                </div>
              )}

              {currencyMode === 'usd' && (
                <div className="mt-1">
                  <span className="text-xl font-black text-emerald-300 tracking-tight block">
                    {formatCurrencyUSD(
                      detailedMetrics.promedioTipoCambio > 0 
                        ? detailedMetrics.totalUtilidadNetaMXN / detailedMetrics.promedioTipoCambio 
                        : 0
                    )}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    {l('Equivalente al TC promedio de', 'Equivalent to weighted FX rate of')} ${detailedMetrics.promedioTipoCambio.toFixed(2)} MXN
                  </span>
                </div>
              )}
            </div>

            {/* 2. Utilidad de Vendedores (Comisión) */}
            <div className="bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-xl">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-300 font-bold uppercase tracking-wider">
                  {l('Utilidad de Vendedores (Comisión)', 'Promoters Yield (Commissions)')}
                </span>
                <span className="text-[10px] text-amber-400 font-mono">{l('Promotores', 'Promoters')}</span>
              </div>

              {currencyMode === 'all_mxn' && (
                <div className="mt-1">
                  <span className="text-lg font-black text-amber-300 tracking-tight block">
                    {formatCurrencyMXN(detailedMetrics.totalComisionesVendedoresMXN)}
                  </span>
                  <span className="text-[10px] text-amber-300/80">
                    {l('Suma total de comisiones repartidas', 'Total sum of distributed commissions')}
                  </span>
                </div>
              )}

              {currencyMode === 'split' && (
                <div className="mt-1 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{l('Dólares (USD):', 'US Dollars (USD):')}</span>
                    <span className="text-sm font-black text-amber-300 font-mono">
                      {formatCurrencyUSD(detailedMetrics.usdTotalComisiones)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{l('Pesos (MXN):', 'Mexican Pesos (MXN):')}</span>
                    <span className="text-sm font-black text-white font-mono">
                      {formatCurrencyMXN(detailedMetrics.mxnTotalComisiones)}
                    </span>
                  </div>
                </div>
              )}

              {currencyMode === 'usd' && (
                <div className="mt-1">
                  <span className="text-lg font-black text-amber-300 tracking-tight block">
                    {formatCurrencyUSD(
                      detailedMetrics.promedioTipoCambio > 0 
                        ? detailedMetrics.totalComisionesVendedoresMXN / detailedMetrics.promedioTipoCambio 
                        : 0
                    )}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    {l('Total comisiones expresadas en USD', 'Total commissions expressed in USD')}
                  </span>
                </div>
              )}
            </div>

            {/* 3. Resto de análisis: Ingresos vs Costos y Tipo de Cambio */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">{l('Ingresos Brutos', 'Gross Revenue')}</span>
                <span className="text-xs font-bold text-white">
                  {formatCurrencyMXN(detailedMetrics.totalIngresosBrutosMXN)}
                </span>
              </div>
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">{l('Costos Directos', 'Direct Costs')}</span>
                <span className="text-xs font-bold text-white font-mono">
                  {formatCurrencyMXN(detailedMetrics.totalCostosDirectosMXN)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer of Resumen Activo: TC Analysis and Net Margin */}
          <div className="text-[11px] text-slate-300/90 pt-2 border-t border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span>{l('Tipo de Cambio Ponderado:', 'Weighted Exchange Rate:')}</span>
              <span className="font-mono font-bold text-sky-300">
                1 USD = ${detailedMetrics.promedioTipoCambio.toFixed(2)} MXN
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{l('Margen Neto Marina:', 'Net Marina Margin:')}</span>
              <span className="font-bold text-emerald-300">
                {detailedMetrics.margenUtilidadNeta.toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
