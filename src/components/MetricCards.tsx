import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Ship, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  PieChart as PieIcon,
  Anchor,
  Coins,
  BadgePercent,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { ExecutiveMetrics, DetailedFinancialMetrics, CurrencyDisplayMode } from '../types/marina';
import { formatCurrencyMXN, formatCurrencyUSD, formatPercent, formatNumber } from '../utils/formatters';

interface MetricCardsProps {
  metrics: ExecutiveMetrics;
  detailedMetrics: DetailedFinancialMetrics;
  selectedWeek: string;
  currencyMode: CurrencyDisplayMode;
  onCurrencyModeChange: (mode: CurrencyDisplayMode) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ 
  metrics, 
  detailedMetrics,
  selectedWeek,
  currencyMode,
  onCurrencyModeChange
}) => {
  return (
    <div className="space-y-4">
      {/* Week Title, Scope banner & Currency Quick Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-[#002147] dark:text-[#66d2ff] tracking-tight flex items-center gap-2">
            <span>Cuadros Informativos Principales</span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#00A3E0]/15 text-[#007ba8] dark:text-[#00A3E0] border border-[#00A3E0]/30">
              {selectedWeek === 'ALL' ? `Acumulado ${new Date().getFullYear()}` : `Semana ${selectedWeek} (${new Date().getFullYear()})`}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fórmulas oficiales: Utilidad Neta (Muelle + Over + Casa) y Comisiones de Vendedores
          </p>
        </div>

        {/* Currency Switcher Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => onCurrencyModeChange('all_mxn')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currencyMode === 'all_mxn'
                  ? 'bg-[#002147] text-white shadow-xs dark:bg-[#00A3E0]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Convertir todo a Pesos Mexicanos (USD multiplicado por Tipo de Cambio)"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Dame todo en pesos</span>
            </button>

            <button
              type="button"
              onClick={() => onCurrencyModeChange('split')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currencyMode === 'split'
                  ? 'bg-[#002147] text-white shadow-xs dark:bg-[#00A3E0]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Ver detalle separado de cuántos Dólares y cuántos Pesos"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Dólares y pesos</span>
            </button>

            <button
              type="button"
              onClick={() => onCurrencyModeChange('usd')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currencyMode === 'usd'
                  ? 'bg-[#002147] text-white shadow-xs dark:bg-[#00A3E0]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Ver equivalencia en Dólares (USD)"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Solo USD</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="font-bold text-[#002147] dark:text-[#00A3E0]">{metrics.totalOperaciones}</span>
            <span>Ops</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="font-bold text-[#002147] dark:text-[#00A3E0]">{metrics.totalPax}</span>
            <span>PAX</span>
          </div>
        </div>
      </div>

      {/* Grid of Key Informative Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Total de utilidad */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          id="card-total-utilidad" 
          className="bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-[#08201d] dark:via-slate-800 dark:to-[#081e33] rounded-2xl p-5 border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Total de utilidad
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Muelle + Over + Casa
            </span>
          </div>

          {/* Main Amount */}
          {currencyMode === 'all_mxn' && (
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
                {formatCurrencyMXN(detailedMetrics.totalUtilidadNetaMXN)}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                Consolidado en Pesos (USD convertidos por TC)
              </p>
            </div>
          )}

          {currencyMode === 'split' && (
            <div className="space-y-1.5 py-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Dólares:</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrencyUSD(detailedMetrics.usdTotalUtilidadNeta)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Pesos:</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {formatCurrencyMXN(detailedMetrics.mxnTotalUtilidadNeta)}
                </span>
              </div>
            </div>
          )}

          {currencyMode === 'usd' && (
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
                {formatCurrencyUSD(
                  detailedMetrics.promedioTipoCambio > 0 
                    ? detailedMetrics.totalUtilidadNetaMXN / detailedMetrics.promedioTipoCambio 
                    : 0
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Equivalente global en USD al TC prom. (${detailedMetrics.promedioTipoCambio.toFixed(2)})
              </p>
            </div>
          )}

          {/* Detailed Sub-Formula Items */}
          <div className="mt-3.5 pt-3 border-t border-emerald-100 dark:border-emerald-900/40 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span>Muelle:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrencyMXN(detailedMetrics.totalMuelleMXN)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Over:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrencyMXN(detailedMetrics.totalOverMXN)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Casa:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrencyMXN(detailedMetrics.totalCasaMXN)}</span>
            </div>
          </div>
        </motion.div>

        {/* CARD 2: Total de Over */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          id="card-total-over" 
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00A3E0]" />
              Total de Over
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
              Columna Over
            </span>
          </div>

          {currencyMode === 'all_mxn' && (
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrencyMXN(detailedMetrics.totalOverMXN)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Suma consolidada de Over en Pesos
              </p>
            </div>
          )}

          {currencyMode === 'split' && (
            <div className="space-y-1.5 py-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Dólares:</span>
                <span className="text-xl font-black text-[#00A3E0] font-mono">
                  {formatCurrencyUSD(detailedMetrics.usdTotalOver)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Pesos:</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {formatCurrencyMXN(detailedMetrics.mxnTotalOver)}
                </span>
              </div>
            </div>
          )}

          {currencyMode === 'usd' && (
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrencyUSD(
                  detailedMetrics.promedioTipoCambio > 0 
                    ? detailedMetrics.totalOverMXN / detailedMetrics.promedioTipoCambio 
                    : 0
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Over consolidado expresado en USD
              </p>
            </div>
          )}

          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Margen retenido directo:</span>
            <span className="font-semibold text-[#002147] dark:text-[#38bdf8]">Retención 100% Casa</span>
          </div>
        </motion.div>

        {/* CARD 3: Total de casa */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          id="card-total-casa" 
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Total de casa
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
              Columna Casa
            </span>
          </div>

          {currencyMode === 'all_mxn' && (
            <div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-400 tracking-tight">
                {formatCurrencyMXN(detailedMetrics.totalCasaMXN)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                50% de la Comisión Neta en Pesos
              </p>
            </div>
          )}

          {currencyMode === 'split' && (
            <div className="space-y-1.5 py-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Dólares:</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {formatCurrencyUSD(detailedMetrics.usdTotalCasa)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Pesos:</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {formatCurrencyMXN(detailedMetrics.mxnTotalCasa)}
                </span>
              </div>
            </div>
          )}

          {currencyMode === 'usd' && (
            <div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-400 tracking-tight">
                {formatCurrencyUSD(
                  detailedMetrics.promedioTipoCambio > 0 
                    ? detailedMetrics.totalCasaMXN / detailedMetrics.promedioTipoCambio 
                    : 0
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Casa consolidada expresada en USD
              </p>
            </div>
          )}

          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Reparto de comisión:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Mitad para Casa</span>
          </div>
        </motion.div>

        {/* CARD 4: Total de comisiones de vendedores */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          id="card-total-comisiones" 
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Total de comisiones de vendedores
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              Columna Comisión
            </span>
          </div>

          {currencyMode === 'all_mxn' && (
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400 tracking-tight">
                {formatCurrencyMXN(detailedMetrics.totalComisionesVendedoresMXN)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Suma de comisiones pagadas en Pesos
              </p>
            </div>
          )}

          {currencyMode === 'split' && (
            <div className="space-y-1.5 py-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Dólares:</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {formatCurrencyUSD(detailedMetrics.usdTotalComisiones)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Pesos:</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {formatCurrencyMXN(detailedMetrics.mxnTotalComisiones)}
                </span>
              </div>
            </div>
          )}

          {currencyMode === 'usd' && (
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400 tracking-tight">
                {formatCurrencyUSD(
                  detailedMetrics.promedioTipoCambio > 0 
                    ? detailedMetrics.totalComisionesVendedoresMXN / detailedMetrics.promedioTipoCambio 
                    : 0
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Comisiones de vendedores en USD
              </p>
            </div>
          )}

          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Beneficiarios:</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">Promotores / Vendedores</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
