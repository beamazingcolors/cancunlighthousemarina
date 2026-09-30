import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Anchor, 
  Users, 
  Percent,
  RefreshCw,
  Coins,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { DetailedFinancialMetrics, CurrencyDisplayMode } from '../types/marina';
import { formatCurrencyMXN, formatCurrencyUSD, formatPercent, formatNumber } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface IncomeExpenseDetailSectionProps {
  metrics: DetailedFinancialMetrics;
  currencyMode: CurrencyDisplayMode;
  onCurrencyModeChange: (mode: CurrencyDisplayMode) => void;
  selectedWeek: string;
}

export const IncomeExpenseDetailSection: React.FC<IncomeExpenseDetailSectionProps> = ({
  metrics,
  currencyMode,
  onCurrencyModeChange,
  selectedWeek
}) => {
  const { language, l } = useLanguage();

  // Percentages of revenue distribution
  const pctCostos = metrics.totalIngresosBrutosMXN > 0
    ? (metrics.totalCostosDirectosMXN / metrics.totalIngresosBrutosMXN) * 100
    : 0;
  const pctComisiones = metrics.totalIngresosBrutosMXN > 0
    ? (metrics.totalComisionesVendedoresMXN / metrics.totalIngresosBrutosMXN) * 100
    : 0;
  const pctUtilidad = metrics.totalIngresosBrutosMXN > 0
    ? (metrics.totalUtilidadNetaMXN / metrics.totalIngresosBrutosMXN) * 100
    : 0;

  return (
    <section 
      id="seccion-ingresos-egresos"
      className="bg-white dark:bg-[#0b1728] rounded-2xl border border-sky-100 dark:border-[#162a4a] shadow-xs overflow-hidden transition-all duration-200"
    >
      {/* Header bar with controls */}
      <div className="bg-[#002147] text-white p-4 sm:p-6 border-b border-[#001733] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#00A3E0]/20 border border-[#00A3E0]/40 flex items-center justify-center text-[#00A3E0]">
              <Scale className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>{l('Detalle Financiero de Ingresos & Egresos', 'Financial Income & Expense Breakdown')}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00A3E0] text-white">
                {selectedWeek === 'ALL' 
                  ? (l(`Acumulado ${new Date().getFullYear()}`, `Cumulative ${new Date().getFullYear()}`)) 
                  : (l(`Semana ${selectedWeek}`, `Week ${selectedWeek}`))}
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            {l('Conciliación de entradas por ventas y derechos de muelle frente a costos netos y comisiones de vendedores.', 'Reconciliation of sales receipts and dockage fees against net costs and promoter commissions.')}
          </p>
        </div>

        {/* Currency Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#001733] p-1 rounded-xl border border-white/10 self-start md:self-auto">
          <button
            type="button"
            onClick={() => onCurrencyModeChange('all_mxn')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currencyMode === 'all_mxn'
                ? 'bg-[#00A3E0] text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title={l('Convertir todos los valores a Pesos Mexicanos usando el tipo de cambio de cada registro', 'Convert all figures to Mexican Pesos using the exchange rate of each record')}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{l('Dame todo en Pesos', 'All in Pesos (MXN)')}</span>
          </button>

          <button
            type="button"
            onClick={() => onCurrencyModeChange('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currencyMode === 'split'
                ? 'bg-[#00A3E0] text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title={l('Ver desglose detallado de cuántos Dólares (USD) y cuántos Pesos (MXN)', 'Detailed breakdown by USD and MXN')}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{l('Dólares y Pesos', 'Dollars & Pesos')}</span>
          </button>

          <button
            type="button"
            onClick={() => onCurrencyModeChange('usd')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currencyMode === 'usd'
                ? 'bg-[#00A3E0] text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title={l('Ver perspectiva en Dólares (USD)', 'View overview in US Dollars (USD)')}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{l('Ver en USD', 'View in USD')}</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Top 3 Core Financial Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: INGRESOS */}
          <div className="bg-slate-50 dark:bg-[#0f233d]/70 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#1e3e68] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1e3e68]/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    {l('Ingresos Brutos', 'Gross Revenue')}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {l('Total cobrado al cliente + Muellaje', 'Total collected from client + Dockage')}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                100% {l('Flujo', 'Flow')}
              </span>
            </div>

            {/* Value Display */}
            <div>
              {currencyMode === 'all_mxn' && (
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatCurrencyMXN(metrics.totalIngresosBrutosMXN)}
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {l('Consolidado en Pesos (USD × TC de tabla)', 'Consolidated in Pesos (USD × Sheet Exchange Rate)')}
                  </span>
                </div>
              )}
              {currencyMode === 'split' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{l('En Dólares:', 'In US Dollars:')}</span>
                    <span className="text-base font-bold text-sky-600 dark:text-sky-400">
                      {formatCurrencyUSD(metrics.usdTotalVentas + metrics.usdTotalMuelle)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{l('En Pesos:', 'In Mexican Pesos:')}</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {formatCurrencyMXN(metrics.mxnTotalVentas + metrics.mxnTotalMuelle)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                    {l('Total equivalente:', 'Equivalent total:')} {formatCurrencyMXN(metrics.totalIngresosBrutosMXN)}
                  </div>
                </div>
              )}
              {currencyMode === 'usd' && (
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatCurrencyUSD(
                      metrics.promedioTipoCambio > 0 
                        ? metrics.totalIngresosBrutosMXN / metrics.promedioTipoCambio 
                        : 0
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {l(`Equivalente global en USD al TC prom. ($${metrics.promedioTipoCambio.toFixed(2)})`, `Global USD equivalent at avg FX ($${metrics.promedioTipoCambio.toFixed(2)})`)}
                  </span>
                </div>
              )}
            </div>

            {/* Income Item Breakdown */}
            <div className="space-y-2 text-xs border-t border-slate-200 dark:border-[#1e3e68]/70 pt-3">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-slate-400" />
                  <span>{l('Ventas de Actividades:', 'Activity Sales:')}</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrencyMXN(metrics.totalVentasMXN)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5 text-[#00A3E0]" />
                  <span>{l('Derecho de Muelle (PAX):', 'Dockage Fee (PAX):')}</span>
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatCurrencyMXN(metrics.totalMuelleMXN)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: EGRESOS */}
          <div className="bg-slate-50 dark:bg-[#0f233d]/70 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#1e3e68] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1e3e68]/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    {l('Egresos Operativos', 'Operating Outflows')}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {l('Costos a proveedores + Comisiones', 'Vendor costs + Promoter commissions')}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                {(pctCostos + pctComisiones).toFixed(1)}% {l('del total', 'of total')}
              </span>
            </div>

            {/* Value Display */}
            <div>
              {currencyMode === 'all_mxn' && (
                <div>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                    {formatCurrencyMXN(metrics.totalEgresosMXN)}
                  </div>
                  <span className="text-[10px] text-rose-500 dark:text-rose-400/80 font-medium">
                    {l('Total egresos directos en Pesos', 'Total direct outflows in Pesos')}
                  </span>
                </div>
              )}
              {currencyMode === 'split' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{l('En Dólares:', 'In US Dollars:')}</span>
                    <span className="text-base font-bold text-rose-500">
                      {formatCurrencyUSD(metrics.usdTotalCostos + metrics.usdTotalComisiones)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{l('En Pesos:', 'In Mexican Pesos:')}</span>
                    <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrencyMXN(metrics.mxnTotalCostos + metrics.mxnTotalComisiones)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                    {l('Total consolidado:', 'Consolidated total:')} {formatCurrencyMXN(metrics.totalEgresosMXN)}
                  </div>
                </div>
              )}
              {currencyMode === 'usd' && (
                <div>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                    {formatCurrencyUSD(
                      metrics.promedioTipoCambio > 0 
                        ? metrics.totalEgresosMXN / metrics.promedioTipoCambio 
                        : 0
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {l('Total egresos directos expresados en USD', 'Total direct outflows in USD')}
                  </span>
                </div>
              )}
            </div>

            {/* Expense Item Breakdown */}
            <div className="space-y-2 text-xs border-t border-slate-200 dark:border-[#1e3e68]/70 pt-3">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>{l('Costo Proveedores (Embarcaciones/Tours):', 'Vendor Costs (Boats / Tours):')}</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrencyMXN(metrics.totalCostosDirectosMXN)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>{l('Comisiones Pagadas a Vendedores:', 'Promoter Sales Commissions Paid:')}</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrencyMXN(metrics.totalComisionesVendedoresMXN)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: RESULTADO NETO (Utilidad Marina) */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-indigo-500/10 dark:from-emerald-950/40 dark:via-[#0b2447] dark:to-indigo-950/40 rounded-xl p-4 sm:p-5 border border-emerald-500/30 dark:border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-900/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                    {l('Utilidad Neta Marina', 'Marina Net Profit')}
                  </h3>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    {l('Fórmula: Muelle + Over + Casa', 'Formula: Dockage + Over + House Share')}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-600 text-white">
                {metrics.margenUtilidadNeta.toFixed(1)}% {l('Margen', 'Margin')}
              </span>
            </div>

            {/* Value Display */}
            <div>
              {currencyMode === 'all_mxn' && (
                <div>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
                    {formatCurrencyMXN(metrics.totalUtilidadNetaMXN)}
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                    {l('Ganancia total neta para la Marina (en MXN)', 'Total net gain for the Marina (in MXN)')}
                  </span>
                </div>
              )}
              {currencyMode === 'split' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-300">{l('En Dólares:', 'In US Dollars:')}</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrencyUSD(metrics.usdTotalUtilidadNeta)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-300">{l('En Pesos:', 'In Mexican Pesos:')}</span>
                    <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                      {formatCurrencyMXN(metrics.mxnTotalUtilidadNeta)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-emerald-200 dark:border-emerald-900/60">
                    {l('Consolidado en MXN:', 'Consolidated in MXN:')} {formatCurrencyMXN(metrics.totalUtilidadNetaMXN)}
                  </div>
                </div>
              )}
              {currencyMode === 'usd' && (
                <div>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
                    {formatCurrencyUSD(
                      metrics.promedioTipoCambio > 0 
                        ? metrics.totalUtilidadNetaMXN / metrics.promedioTipoCambio 
                        : 0
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {l('Ganancia neta total convertida a USD', 'Total net profit converted to USD')}
                  </span>
                </div>
              )}
            </div>

            {/* Formula breakdown */}
            <div className="space-y-1.5 text-[11px] border-t border-emerald-200 dark:border-emerald-900/60 pt-3">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                <span>+ {l('Muelle (Atraque PAX):', 'Dockage (PAX):')}</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrencyMXN(metrics.totalMuelleMXN)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                <span>+ Over ({l('Margen retenido', 'Retained markup')}):</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrencyMXN(metrics.totalOverMXN)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                <span>+ {l('Casa (50% Comisión Neta):', 'House (50% Net Commission):')}</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrencyMXN(metrics.totalCasaMXN)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Distribution Bar */}
        <div className="p-4 bg-slate-50 dark:bg-[#0f233d]/50 rounded-xl border border-slate-200 dark:border-[#1e3e68] space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {l('Distribución Proporcional de Cada Peso Ingresado (100%)', 'Proportional Breakdown of Every Earned Peso (100%)')}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {l('Tipo de Cambio Promedio Aplicado:', 'Applied Average FX Rate:')} 1 USD = ${metrics.promedioTipoCambio.toFixed(2)} MXN
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${pctCostos}%` }} 
              className="bg-rose-500 hover:bg-rose-600 transition-all duration-300"
              title={`${l('Costos Proveedor', 'Vendor Costs')}: ${pctCostos.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${pctComisiones}%` }} 
              className="bg-amber-500 hover:bg-amber-600 transition-all duration-300"
              title={`${l('Comisiones Vendedores', 'Promoter Commissions')}: ${pctComisiones.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${pctUtilidad}%` }} 
              className="bg-emerald-500 hover:bg-emerald-600 transition-all duration-300"
              title={`${l('Utilidad Neta Marina', 'Marina Net Profit')}: ${pctUtilidad.toFixed(1)}%`}
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300">
                {l('Costo Proveedores:', 'Vendor Costs:')} <strong>{pctCostos.toFixed(1)}%</strong> ({formatCurrencyMXN(metrics.totalCostosDirectosMXN)})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300">
                {l('Comisión Vendedores:', 'Promoter Commissions:')} <strong>{pctComisiones.toFixed(1)}%</strong> ({formatCurrencyMXN(metrics.totalComisionesVendedoresMXN)})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300">
                {l('Utilidad Marina (Muelle+Over+Casa):', 'Marina Profit (Dock+Over+House):')} <strong>{pctUtilidad.toFixed(1)}%</strong> ({formatCurrencyMXN(metrics.totalUtilidadNetaMXN)})
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Table by Currency (Dólares vs Pesos) */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#1e3e68]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#002147] text-white">
                <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-[11px]">{l('Concepto Financiero', 'Financial Concept')}</th>
                <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-[11px] text-right">
                  {l(`En Dólares (${metrics.usdRecordsCount} ops)`, `In US Dollars (${metrics.usdRecordsCount} ops)`)}
                </th>
                <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-[11px] text-right">
                  {l(`En Pesos (${metrics.mxnRecordsCount} ops)`, `In Mexican Pesos (${metrics.mxnRecordsCount} ops)`)}
                </th>
                <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-[11px] text-right bg-[#001733] text-sky-200">
                  {l('Total Consolidado en Pesos (MXN)', 'Consolidated Total in Pesos (MXN)')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-3.5 font-medium">{l('Venta Cobrada al Cliente', 'Sale Collected from Client')}</td>
                <td className="py-2 px-3.5 font-mono text-right text-sky-600 dark:text-sky-400">
                  {formatCurrencyUSD(metrics.usdTotalVentas)}
                </td>
                <td className="py-2 px-3.5 font-mono text-right text-slate-800 dark:text-slate-200">
                  {formatCurrencyMXN(metrics.mxnTotalVentas)}
                </td>
                <td className="py-2 px-3.5 font-mono text-right font-bold text-[#002147] dark:text-white bg-slate-50/50 dark:bg-slate-900/30">
                  {formatCurrencyMXN(metrics.totalVentasMXN)}
                </td>
              </tr>

              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-3.5 font-medium">{l('Costo Reporte Neto a Proveedores', 'Net Reported Cost to Vendors')}</td>
                <td className="py-2 px-3.5 font-mono text-right text-rose-600 dark:text-rose-400">
                  {formatCurrencyUSD(metrics.usdTotalCostos)}
                </td>
                <td className="py-2 px-3.5 font-mono text-right text-rose-600 dark:text-rose-400">
                  {formatCurrencyMXN(metrics.mxnTotalCostos)}
                </td>
                <td className="py-2 px-3.5 font-mono text-right font-bold text-rose-700 dark:text-rose-400 bg-slate-50/50 dark:bg-slate-900/30">
                  {formatCurrencyMXN(metrics.totalCostosDirectosMXN)}
                </td>
              </tr>

              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-3.5 font-medium">{l('Total de Over (Margen retenido)', 'Total Over (Retained Margin)')}</td>
                <td className="py-2 px-3.5 font-mono text-right text-emerald-600 dark:text-emerald-400">
                  {formatCurrencyUSD(metrics.usdTotalOver)}
                </td>
                <td className="py-2 px-3.5 font-mono text-right text-emerald-600 dark:text-emerald-400">
                  {formatCurrencyMXN(metrics.mxnTotalOver)}
                </td>
                <td className="py-2 px-3.5 font-mono text-right font-bold text-emerald-700 dark:text-emerald-400 bg-slate-50/50 dark:bg-slate-900/30">
                  {formatCurrencyMXN(metrics.totalOverMXN)}
                </td>
              </tr>

              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-3.5 font-medium">{l('Total de Casa (50% Comisión Neta)', 'Total House Share (50% Net Commission)')}</td>
                <td className="py-2 px-3.5 font-mono text-right text-emerald-600 dark:text-emerald-400">
                  {formatCurrencyUSD(metrics.usdTotalCasa)}
                </td>
                <td className="py-2 px-3.5 font-mono text-right text-emerald-600 dark:text-emerald-400">
                  {formatCurrencyMXN(metrics.mxnTotalCasa)}
                </td>
                <td className="py-2 px-3.5 font-mono text-right font-bold text-emerald-700 dark:text-emerald-400 bg-slate-50/50 dark:bg-slate-900/30">
                  {formatCurrencyMXN(metrics.totalCasaMXN)}
                </td>
              </tr>

              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-3.5 font-medium">{l('Total de Comisiones de Vendedores', 'Total Promoter Commissions')}</td>
                <td className="py-2 px-3.5 font-mono text-right text-amber-600 dark:text-amber-400">
                  {formatCurrencyUSD(metrics.usdTotalComisiones)}
                </td>
                <td className="py-2 px-3.5 font-mono text-right text-amber-600 dark:text-amber-400">
                  {formatCurrencyMXN(metrics.mxnTotalComisiones)}
                </td>
                <td className="py-2 px-3.5 font-mono text-right font-bold text-amber-700 dark:text-amber-400 bg-slate-50/50 dark:bg-slate-900/30">
                  {formatCurrencyMXN(metrics.totalComisionesVendedoresMXN)}
                </td>
              </tr>

              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-3.5 font-medium">{l('Total Muelle (Derecho de Atraque)', 'Total Dockage Fee')}</td>
                <td className="py-2 px-3.5 font-mono text-right text-[#00A3E0]">
                  {formatCurrencyUSD(metrics.usdTotalMuelle)}
                </td>
                <td className="py-2 px-3.5 font-mono text-right text-[#00A3E0]">
                  {formatCurrencyMXN(metrics.mxnTotalMuelle)}
                </td>
                <td className="py-2 px-3.5 font-mono text-right font-bold text-[#00A3E0] bg-slate-50/50 dark:bg-slate-900/30">
                  {formatCurrencyMXN(metrics.totalMuelleMXN)}
                </td>
              </tr>

              {/* Total Utilidad Row */}
              <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-bold border-t-2 border-emerald-300 dark:border-emerald-700">
                <td className="py-2.5 px-3.5 text-emerald-900 dark:text-emerald-200">
                  {l('Total de Utilidad Neta (Muelle + Over + Casa)', 'Total Net Profit (Dock + Over + House Share)')}
                </td>
                <td className="py-2.5 px-3.5 font-mono text-right text-emerald-700 dark:text-emerald-300">
                  {formatCurrencyUSD(metrics.usdTotalUtilidadNeta)}
                </td>
                <td className="py-2.5 px-3.5 font-mono text-right text-emerald-700 dark:text-emerald-300">
                  {formatCurrencyMXN(metrics.mxnTotalUtilidadNeta)}
                </td>
                <td className="py-2.5 px-3.5 font-mono text-right text-base text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/50">
                  {formatCurrencyMXN(metrics.totalUtilidadNetaMXN)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
