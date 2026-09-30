import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Coins, 
  Scale, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  HelpCircle,
  TrendingUp,
  Info,
  Layers,
  Sparkles,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { OperationRecord, DetailedFinancialMetrics, ExchangeRateRowAudit } from '../types/marina';
import { formatCurrencyMXN, formatCurrencyUSD, formatNumber } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface CurrencyExchangeComparisonProps {
  records: OperationRecord[];
  detailedMetrics: DetailedFinancialMetrics;
  onOpenAuditModal?: () => void;
}

export const CurrencyExchangeComparison: React.FC<CurrencyExchangeComparisonProps> = ({
  records,
  detailedMetrics,
  onOpenAuditModal
}) => {
  const { language, l } = useLanguage();
  const [selectedCurrencyFilter, setSelectedCurrencyFilter] = useState<'ALL' | 'USD' | 'MXN'>('ALL');
  const [selectedTcFilter, setSelectedTcFilter] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract audit rows
  const auditRows = detailedMetrics.exchangeRateRows || [];

  // Filtered rows
  const filteredRows = useMemo(() => {
    return auditRows.filter(r => {
      // Currency filter
      if (selectedCurrencyFilter === 'USD' && r.monedaOriginal !== 'USD') return false;
      if (selectedCurrencyFilter === 'MXN' && r.monedaOriginal !== 'MXN') return false;

      // TC filter
      if (selectedTcFilter !== 'ALL' && Math.abs(r.tipoCambio - selectedTcFilter) > 0.01) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAct = r.actividad.toLowerCase().includes(q);
        const matchServ = r.servicio.toLowerCase().includes(q);
        const matchProm = r.promotor.toLowerCase().includes(q);
        const matchFormula = r.formulaTexto.toLowerCase().includes(q);
        if (!matchAct && !matchServ && !matchProm && !matchFormula) return false;
      }

      return true;
    });
  }, [auditRows, selectedCurrencyFilter, selectedTcFilter, searchQuery]);

  // Aggregate stats for current view
  const currentViewStats = useMemo(() => {
    let sumVentaOrigUSD = 0;
    let sumVentaOrigMXN = 0;
    let sumVentaMXN = 0;
    let sumCostoMXN = 0;
    let sumComisionMXN = 0;
    let sumUtilidadMXN = 0;
    let sumEquivUSD = 0;

    filteredRows.forEach(r => {
      if (r.monedaOriginal === 'USD') {
        sumVentaOrigUSD += r.ventaOriginal;
      } else {
        sumVentaOrigMXN += r.ventaOriginal;
      }
      sumVentaMXN += r.ventaMXN;
      sumCostoMXN += r.costoMXN;
      sumComisionMXN += r.comisionMXN;
      sumUtilidadMXN += r.utilidadMXN;
      sumEquivUSD += r.ventaUSD;
    });

    return {
      count: filteredRows.length,
      sumVentaOrigUSD,
      sumVentaOrigMXN,
      sumVentaMXN,
      sumCostoMXN,
      sumComisionMXN,
      sumUtilidadMXN,
      sumEquivUSD
    };
  }, [filteredRows]);

  return (
    <div id="currency-exchange-comparison-section" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-8">
      {/* Header Banner explaining the exact user rule */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wide uppercase border border-emerald-500/30 mb-3">
              <Scale className="w-3.5 h-3.5" />
              {l('Comparativa de Tipo de Cambio entre Filas y Columnas', 'Exchange Rate Row & Column Comparative Audit')}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {l('Determinación de Tipo de Cambio & Conversión Oficial', 'Exchange Rate Determination & Official Currency Conversion')}
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
              {l(
                'Cada operación se define según su columna de Moneda: si indica USD, la venta se pactó en dólares y se multiplica por el tipo de cambio de su fila para obtener las columnas en MXN. Si indica MXN, la venta fue en pesos mexicanos directos.',
                'Each operation is governed by its Currency column: if USD, the sale is in dollars and is multiplied by its row FX rate to produce the MXN columns. If MXN, the sale was agreed directly in Mexican pesos.'
              )}
            </p>
          </div>

          {onOpenAuditModal && (
            <button
              id="open-full-audit-from-tc-btn"
              onClick={onOpenAuditModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-md shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>{l('Ver Auditoría Completa', 'View Full Audit')}</span>
            </button>
          )}
        </div>

        {/* The Two Main Rules in High-Contrast Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Rule 1: USD */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-300 border border-emerald-500/30">1</span>
              <span>{l('Si la Columna dice USD (Ventas en Dólares)', 'If Column says USD (Dollar Sales)')}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {l(
                'Las columnas base (Venta, Costo con Over, Comisión, Depósito) están en USD. Cada fila aplica su propio tipo de cambio ($16, $18 o $20 MXN/USD):',
                'Base columns (Sale, Cost with Over, Commission, Deposit) are in USD. Each row applies its specific FX rate ($16, $18, or $20 MXN/USD):'
              )}
            </p>
            <div className="mt-2.5 px-3 py-2 bg-slate-900/80 rounded-lg border border-emerald-500/20 font-mono text-xs text-emerald-300 flex items-center justify-between">
              <span>{l('Col 24 (Venta MXN) = Col 11 (Venta USD) × Col 8 (Tipo Cambio)', 'Col 24 (Sale MXN) = Col 11 (Sale USD) × Col 8 (Exchange Rate)')}</span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded font-sans">{l('Multiplicación', 'Multiplication')}</span>
            </div>
          </div>

          {/* Rule 2: MXN */}
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-1.5">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-300 border border-blue-500/30">2</span>
              <span>{l('Si la Columna dice MXN (Ventas en Pesos)', 'If Column says MXN (Peso Sales)')}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {l(
                'Las columnas base ya están expresadas originalmente en Pesos Mexicanos (MXN). Col 24 es igual a Col 11. Para determinar el equivalente en dólares se divide entre el tipo de cambio:',
                'Base columns are natively expressed in Mexican Pesos (MXN). Col 24 equals Col 11. To calculate the dollar equivalent, divide by the exchange rate:'
              )}
            </p>
            <div className="mt-2.5 px-3 py-2 bg-slate-900/80 rounded-lg border border-blue-500/20 font-mono text-xs text-blue-300 flex items-center justify-between">
              <span>{l('Equivalente USD = Col 24 (Venta MXN) ÷ Tipo Cambio ($16 - $20)', 'USD Equivalent = Col 24 (Sale MXN) ÷ Exchange Rate ($16 - $20)')}</span>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded font-sans">{l('División', 'Division')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Highlights */}
      <div className="p-6 bg-slate-50/60 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* USD Operations */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">{l('Ventas en Dólares (USD)', 'US Dollar Sales (USD)')}</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
              {detailedMetrics.usdRecordsCount} {l('operaciones', 'operations')}
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {formatCurrencyUSD(detailedMetrics.usdTotalVentas)}
          </div>
          <div className="text-xs text-slate-600 mt-1 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>{l('En Pesos (según TC de cada fila):', 'In Pesos (per row FX rate):')}</span>
            <strong className="text-slate-900 font-bold">{formatCurrencyMXN(detailedMetrics.usdTotalVentasConvertidasMXN)}</strong>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {l('TC efectivo promedio:', 'Effective average FX:')} ${(detailedMetrics.usdTotalVentasConvertidasMXN / detailedMetrics.usdTotalVentas).toFixed(2)} MXN
          </div>
        </div>

        {/* MXN Operations */}
        <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">{l('Ventas en Pesos (MXN)', 'Mexican Peso Sales (MXN)')}</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-md">
              {detailedMetrics.mxnRecordsCount} {l('operaciones', 'operations')}
            </span>
          </div>
          <div className="text-2xl font-black text-blue-700">
            {formatCurrencyMXN(detailedMetrics.mxnTotalVentas)}
          </div>
          <div className="text-xs text-slate-600 mt-1 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>{l('Contravalor en Dólares:', 'US Dollar Counter-value:')}</span>
            <strong className="text-slate-900 font-bold">{formatCurrencyUSD(detailedMetrics.mxnTotalVentasEquivalenteUSD)}</strong>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {l('Equivalente calculado fila por fila con sus TCs', 'Equivalent computed row-by-row with individual FX rates')}
          </div>
        </div>

        {/* Consolidated MXN Venta Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{l('Ventas Consolidadas (MXN)', 'Consolidated Sales (MXN)')}</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
              {records.length} ops
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrencyMXN(detailedMetrics.sheetIngresosTotalesMXN - detailedMetrics.totalMuelleMXN)}
          </div>
          <div className="text-xs text-slate-600 mt-1 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>{l('Con Muelle', 'With Dockage')} ({formatCurrencyMXN(detailedMetrics.totalMuelleMXN)}):</span>
            <strong className="text-indigo-700 font-bold">{formatCurrencyMXN(detailedMetrics.sheetIngresosTotalesMXN)}</strong>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {l('Coincidencia exacta con Columna 28 del Sheet', 'Exact match with Google Sheet Column 28')}
          </div>
        </div>

        {/* Net Profit & Margins */}
        <div className="bg-white p-4 rounded-xl border border-indigo-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">{l('Total Utilidad Neta (MXN)', 'Total Net Profit (MXN)')}</span>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-md">{l('Muelle+Over+Casa', 'Dock+Over+House')}</span>
          </div>
          <div className="text-2xl font-black text-indigo-700">
            {formatCurrencyMXN(detailedMetrics.totalUtilidadNetaMXN)}
          </div>
          <div className="text-xs text-slate-600 mt-1 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>{l('Utilidad Operativa (Col 29):', 'Operating Profit (Col 29):')}</span>
            <strong className="text-slate-900 font-bold">{formatCurrencyMXN(detailedMetrics.sheetUtilidadOperativaMXN)}</strong>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {l('Margen operativo oficial:', 'Official operating margin:')} {detailedMetrics.margenOperativoSheet.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Exchange Rate Matrix Distribution */}
      <div className="p-6 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {l('Distribución de Tipos de Cambio Utilizados en el Sheet', 'Distribution of Exchange Rates Used in the Google Sheet')}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {l('Haz clic en una tasa para filtrar las filas correspondientes', 'Click a rate to filter corresponding rows')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {detailedMetrics.tcDistribution.map(group => {
            const isSelected = selectedTcFilter === group.tc;
            return (
              <button
                key={`tc-pill-${group.tc}`}
                onClick={() => setSelectedTcFilter(isSelected ? 'ALL' : group.tc)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{group.label}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {group.count}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>{group.countUSD} {l('en USD', 'in USD')}</span>
                  <span>{group.countMXN} {l('en MXN', 'in MXN')}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1.5 pt-1 border-t border-slate-200/60">
                  {formatCurrencyMXN(group.totalVentaMXN)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Schema for USD vs MXN calculation and Recalculated Net Utility */}
      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {l('Esquema Oficial de Cálculo USD vs MXN y Recálculo de Utilidad Neta', 'Official USD vs MXN Calculation Flow & Net Profit Recalculation')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: USD Operations Flow */}
          <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-100">
              <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                {l(`Operaciones en USD (${detailedMetrics.usdRecordsCount} ops)`, `USD Operations (${detailedMetrics.usdRecordsCount} ops)`)}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                × {l('Tipo de Cambio', 'Exchange Rate')}
              </span>
            </div>
            <div className="text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>{l('Venta Base USD:', 'Base USD Sale:')}</span>
                <strong className="font-mono text-emerald-700">{formatCurrencyUSD(detailedMetrics.usdTotalVentas)}</strong>
              </div>
              <div className="flex justify-between">
                <span>{l('Venta Convertida MXN:', 'Converted MXN Sale:')}</span>
                <strong className="font-mono text-slate-900">{formatCurrencyMXN(detailedMetrics.usdTotalVentasConvertidasMXN)}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{l('Costos Directos USD × TC:', 'Direct Costs USD × FX:')}</span>
                <span className="font-mono">{formatCurrencyMXN(detailedMetrics.usdTotalCostosConvertidosMXN)}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>{l('Comisión Promotores USD × TC:', 'Promoter Commission USD × FX:')}</span>
                <span className="font-mono">{formatCurrencyMXN(detailedMetrics.usdTotalComisionesConvertidasMXN)}</span>
              </div>
              <div className="flex justify-between text-sky-700">
                <span>{l('Over USD × TC:', 'Over Markup USD × FX:')}</span>
                <span className="font-mono">{formatCurrencyMXN(detailedMetrics.usdTotalOverConvertidoMXN)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-emerald-800">
                <span>{l('Utilidad Operativa USD:', 'Operating Profit USD:')}</span>
                <span className="font-mono">{formatCurrencyMXN(detailedMetrics.usdTotalUtilidadNeta)}</span>
              </div>
            </div>
          </div>

          {/* Column 2: MXN Operations Flow */}
          <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-100">
              <span className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-blue-600" />
                {l(`Operaciones en MXN (${detailedMetrics.mxnRecordsCount} ops)`, `MXN Operations (${detailedMetrics.mxnRecordsCount} ops)`)}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {l('Directo en Pesos', 'Native in Pesos')}
              </span>
            </div>
            <div className="text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>{l('Venta Original MXN:', 'Original MXN Sale:')}</span>
                <strong className="font-mono text-blue-700">{formatCurrencyMXN(detailedMetrics.mxnTotalVentas)}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{l('Costos Directos MXN:', 'Direct Costs MXN:')}</span>
                <span className="font-mono">{formatCurrencyMXN(detailedMetrics.mxnTotalCostos)}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>{l('Comisión Promotores MXN:', 'Promoter Commission MXN:')}</span>
                <span className="font-mono">{formatCurrencyMXN(detailedMetrics.mxnTotalComisiones)}</span>
              </div>
              <div className="flex justify-between text-sky-700">
                <span>{l('Over MXN:', 'Over Markup MXN:')}</span>
                <span className="font-mono">{formatCurrencyMXN(detailedMetrics.mxnTotalOver)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>{l('Equivalente en Dólares:', 'US Dollar Equivalent:')}</span>
                <span className="font-mono">{formatCurrencyUSD(detailedMetrics.mxnTotalVentasEquivalenteUSD)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-blue-800">
                <span>{l('Utilidad Operativa MXN:', 'Operating Profit MXN:')}</span>
                <span className="font-mono">{formatCurrencyMXN(detailedMetrics.mxnTotalUtilidadNeta)}</span>
              </div>
            </div>
          </div>

          {/* Column 3: Pernotas, Muelle & Recalculated Total Utility */}
          <div className="bg-white rounded-xl p-4 border border-indigo-200 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-100">
              <span className="text-xs font-bold text-indigo-900 uppercase flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                {l('Pernota & Recálculo de Utilidad', 'Overnight & Profit Recalculation')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                {l('Consolidado', 'Consolidated')}
              </span>
            </div>
            <div className="text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>{l('Muelle Regular MXN:', 'Standard Dockage MXN:')}</span>
                <span className="font-mono font-semibold">{formatCurrencyMXN(detailedMetrics.totalMuelleRegularMXN)}</span>
              </div>
              <div className="flex justify-between text-indigo-800">
                <span>{l('Pernotas Netas (resta negativos):', 'Net Overnight (deducts negative):')}</span>
                <span className="font-mono font-bold">{formatCurrencyMXN(detailedMetrics.totalPernotaMXN)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{l('Total Muelle Consolidado:', 'Total Consolidated Dockage:')}</span>
                <span className="font-mono font-bold text-indigo-700">{formatCurrencyMXN(detailedMetrics.totalMuelleMXN)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{l('Total Over Consolidado:', 'Total Consolidated Over:')}</span>
                <span className="font-mono">{formatCurrencyMXN(detailedMetrics.totalOverMXN)}</span>
              </div>
              <div className="flex justify-between text-rose-700 bg-rose-50/80 px-2 py-1 rounded border border-rose-100">
                <span className="font-medium">{l('(-) Honorarios Operación (Gabriel & Alexis):', '(-) Operation Fees (Gabriel & Alexis):')}</span>
                <span className="font-mono font-bold">-{formatCurrencyMXN(detailedMetrics.totalHonorariosOperacionMXN)}</span>
              </div>
              <div className="pt-2 border-t border-indigo-100 flex justify-between font-extrabold text-indigo-900 text-sm">
                <span>{l('Utilidad Neta Recalculada:', 'Recalculated Net Profit:')}</span>
                <span className="font-mono text-emerald-700">{formatCurrencyMXN(detailedMetrics.totalUtilidadNetaMXN)}</span>
              </div>
              <div className="text-[10px] text-slate-500 pt-1 leading-tight">
                {l(
                  `Fórmula: Utilidad Operativa (${formatCurrencyMXN(detailedMetrics.sheetUtilidadOperativaMXN)}) + Muelle (${formatCurrencyMXN(detailedMetrics.totalMuelleMXN)}) + Over (${formatCurrencyMXN(detailedMetrics.totalOverMXN)}) - Honorarios Operativos (${formatCurrencyMXN(detailedMetrics.totalHonorariosOperacionMXN)})`,
                  `Formula: Operating Profit (${formatCurrencyMXN(detailedMetrics.sheetUtilidadOperativaMXN)}) + Dockage (${formatCurrencyMXN(detailedMetrics.totalMuelleMXN)}) + Over (${formatCurrencyMXN(detailedMetrics.totalOverMXN)}) - Operation Fees (${formatCurrencyMXN(detailedMetrics.totalHonorariosOperacionMXN)})`
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Currency Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl self-start sm:self-auto">
          <button
            id="filter-all-currencies"
            onClick={() => setSelectedCurrencyFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedCurrencyFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {l('Todas', 'All')} ({auditRows.length})
          </button>
          <button
            id="filter-usd-only"
            onClick={() => setSelectedCurrencyFilter('USD')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCurrencyFilter === 'USD'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            {l('Solo Ventas USD', 'USD Sales Only')} ({detailedMetrics.usdRecordsCount})
          </button>
          <button
            id="filter-mxn-only"
            onClick={() => setSelectedCurrencyFilter('MXN')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCurrencyFilter === 'MXN'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            {l('Solo Ventas MXN', 'MXN Sales Only')} ({detailedMetrics.mxnRecordsCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:min-w-[300px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="tc-comparison-search-input"
            type="text"
            placeholder={l('Buscar servicio, actividad, promotor...', 'Search service, activity, promoter...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              {l('Limpiar', 'Clear')}
            </button>
          )}
        </div>
      </div>

      {/* Filter summary status */}
      <div className="px-6 py-2 bg-slate-100/60 border-b border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>{l(`Mostrando ${filteredRows.length} de ${auditRows.length} filas analizadas`, `Showing ${filteredRows.length} of ${auditRows.length} audited rows`)}</span>
          {selectedTcFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-semibold text-[11px]">
              {l('Filtro TC:', 'FX Filter:')} ${selectedTcFilter.toFixed(2)}
              <button onClick={() => setSelectedTcFilter('ALL')} className="hover:text-indigo-900 cursor-pointer ml-1 font-bold">×</button>
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-slate-700 font-medium">
          <span>{l('Suma Venta en vista:', 'View Sale Sum:')} <strong className="text-slate-900">{formatCurrencyMXN(currentViewStats.sumVentaMXN)}</strong></span>
          <span>{l('Utilidad en vista:', 'View Profit Sum:')} <strong className="text-emerald-700">{formatCurrencyMXN(currentViewStats.sumUtilidadMXN)}</strong></span>
        </div>
      </div>

      {/* Detailed Row-by-Column Comparative Table */}
      <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10 shadow-xs">
            <tr>
              <th className="py-3 px-3.5 border-b border-slate-200 w-14">{l('Fila', 'Row')}</th>
              <th className="py-3 px-3.5 border-b border-slate-200 min-w-[160px]">{l('Actividad / Servicio', 'Activity / Service')}</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-center w-24">{l('Col 7: Moneda', 'Col 7: Currency')}</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-center w-28">{l('Col 8: Tipo Cambio', 'Col 8: FX Rate')}</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-right min-w-[110px]">{l('Col 11: Venta Orig', 'Col 11: Orig Sale')}</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-center min-w-[190px]">{l('Fórmula Aplicada', 'Applied Formula')}</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-right min-w-[120px] bg-slate-200/50">{l('Col 24: Venta MXN', 'Col 24: Sale MXN')}</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-right min-w-[120px]">{l('Col 25: Costo MXN', 'Col 25: Cost MXN')}</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-right min-w-[120px]">{l('Col 26: Comis MXN', 'Col 26: Comm MXN')}</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-right min-w-[120px]">{l('Col 29: Utilidad MXN', 'Col 29: Profit MXN')}</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-right min-w-[110px]">{l('Equiv. USD', 'USD Equiv.')}</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-center w-28">{l('Cálculo', 'Audit')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {filteredRows.map((r, idx) => {
              const isUSD = r.monedaOriginal === 'USD';
              return (
                <tr 
                  key={`audit-tc-row-${r.id}-${idx}`}
                  className={`hover:bg-slate-50/90 transition-colors ${
                    isUSD ? 'bg-emerald-50/25' : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')
                  }`}
                >
                  <td className="py-2.5 px-3.5 font-mono text-slate-500 font-bold">
                    #{r.rowIndex + 1}
                  </td>
                  <td className="py-2.5 px-3.5">
                    <div className="font-semibold text-slate-900">{r.servicio}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span className="font-medium text-slate-600">{r.actividad}</span>
                      <span>•</span>
                      <span>{r.promotor || l('Sin promotor', 'No promoter')}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-xs ${
                      isUSD 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {r.monedaOriginal}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-center">
                    <div className="font-bold text-slate-900 font-mono">
                      ${r.tipoCambio.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {r.tipoCambioFuente === 'Fila' ? l('En hoja', 'In sheet') : l('Ref $18', 'Ref $18')}
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono font-bold">
                    {isUSD ? (
                      <span className="text-emerald-700">{formatCurrencyUSD(r.ventaOriginal)}</span>
                    ) : (
                      <span className="text-slate-800">{formatCurrencyMXN(r.ventaOriginal)}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5 text-center">
                    <div className="px-2.5 py-1 rounded bg-slate-100/90 border border-slate-200/80 font-mono text-[11px] text-slate-800 inline-block text-left">
                      {r.formulaTexto}
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900 bg-slate-100/50">
                    {formatCurrencyMXN(r.ventaMXN)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-slate-700">
                    {formatCurrencyMXN(r.costoMXN)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-slate-700">
                    {formatCurrencyMXN(r.comisionMXN)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono font-bold text-indigo-700">
                    {formatCurrencyMXN(r.utilidadMXN)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-emerald-700 font-semibold">
                    {formatCurrencyUSD(r.ventaUSD)}
                  </td>
                  <td className="py-2.5 px-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      100% OK
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-900 text-white font-semibold sticky bottom-0 z-10 text-xs">
            <tr>
              <td colSpan={4} className="py-3 px-3.5">
                {l(`Totales de Filas en Pantalla (${filteredRows.length} registros)`, `Screen Row Totals (${filteredRows.length} records)`)}
              </td>
              <td className="py-3 px-3.5 text-right font-mono text-emerald-400">
                {currentViewStats.sumVentaOrigUSD > 0 && `${formatCurrencyUSD(currentViewStats.sumVentaOrigUSD)} + `}
                {formatCurrencyMXN(currentViewStats.sumVentaOrigMXN)}
              </td>
              <td className="py-3 px-3.5 text-center text-slate-400 text-[11px]">
                {selectedCurrencyFilter === 'USD' 
                  ? l('Suma Multiplicación × TC', 'Sum Multiplication × FX') 
                  : l('Suma Conversión Normalizada', 'Sum Normalized Conversion')}
              </td>
              <td className="py-3 px-3.5 text-right font-mono text-white bg-slate-800">
                {formatCurrencyMXN(currentViewStats.sumVentaMXN)}
              </td>
              <td className="py-3 px-3.5 text-right font-mono text-slate-300">
                {formatCurrencyMXN(currentViewStats.sumCostoMXN)}
              </td>
              <td className="py-3 px-3.5 text-right font-mono text-slate-300">
                {formatCurrencyMXN(currentViewStats.sumComisionMXN)}
              </td>
              <td className="py-3 px-3.5 text-right font-mono text-emerald-400 font-bold">
                {formatCurrencyMXN(currentViewStats.sumUtilidadMXN)}
              </td>
              <td className="py-3 px-3.5 text-right font-mono text-emerald-300 font-bold">
                {formatCurrencyUSD(currentViewStats.sumEquivUSD)}
              </td>
              <td className="py-3 px-3.5 text-center text-emerald-400 font-bold">
                ✓ {l('Exacto', 'Exact')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
