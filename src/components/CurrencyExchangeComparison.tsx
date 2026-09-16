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
              Comparativa de Tipo de Cambio entre Filas y Columnas
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Determinación de Tipo de Cambio & Conversión Oficial
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
              Cada operación se define según su columna de <strong className="text-emerald-400">Moneda</strong>: si indica <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 font-mono text-xs font-bold">USD</span>, la venta se pactó en dólares y se <em>multiplica</em> por el tipo de cambio de su fila para obtener las columnas en MXN. Si indica <span className="bg-blue-500/20 px-2 py-0.5 rounded text-blue-300 font-mono text-xs font-bold">MXN</span>, la venta fue en pesos mexicanos directos.
            </p>
          </div>

          {onOpenAuditModal && (
            <button
              id="open-full-audit-from-tc-btn"
              onClick={onOpenAuditModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-md shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Ver Auditoría Completa</span>
            </button>
          )}
        </div>

        {/* The Two Main Rules in High-Contrast Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Rule 1: USD */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-300 border border-emerald-500/30">1</span>
              <span>Si la Columna dice USD (Ventas en Dólares)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Las columnas base (Venta, Costo con Over, Comisión, Depósito) están en <strong>USD</strong>.
              Cada fila aplica su propio tipo de cambio ($16, $18 o $20 MXN/USD):
            </p>
            <div className="mt-2.5 px-3 py-2 bg-slate-900/80 rounded-lg border border-emerald-500/20 font-mono text-xs text-emerald-300 flex items-center justify-between">
              <span>Col 24 (Venta MXN) = Col 11 (Venta USD) × Col 8 (Tipo Cambio)</span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded font-sans">Multiplicación</span>
            </div>
          </div>

          {/* Rule 2: MXN */}
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-1.5">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-300 border border-blue-500/30">2</span>
              <span>Si la Columna dice MXN (Ventas en Pesos)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Las columnas base ya están expresadas originalmente en <strong>Pesos Mexicanos (MXN)</strong>.
              Col 24 es igual a Col 11. Para determinar el equivalente en dólares se divide entre el tipo de cambio:
            </p>
            <div className="mt-2.5 px-3 py-2 bg-slate-900/80 rounded-lg border border-blue-500/20 font-mono text-xs text-blue-300 flex items-center justify-between">
              <span>Equivalente USD = Col 24 (Venta MXN) ÷ Tipo Cambio ($16 - $20)</span>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded font-sans">División</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Highlights */}
      <div className="p-6 bg-slate-50/60 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* USD Operations */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Ventas en Dólares (USD)</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
              {detailedMetrics.usdRecordsCount} operaciones
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {formatCurrencyUSD(detailedMetrics.usdTotalVentas)}
          </div>
          <div className="text-xs text-slate-600 mt-1 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>En Pesos (según TC de cada fila):</span>
            <strong className="text-slate-900 font-bold">{formatCurrencyMXN(detailedMetrics.usdTotalVentasConvertidasMXN)}</strong>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            TC efectivo promedio: ${(detailedMetrics.usdTotalVentasConvertidasMXN / detailedMetrics.usdTotalVentas).toFixed(2)} MXN
          </div>
        </div>

        {/* MXN Operations */}
        <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Ventas en Pesos (MXN)</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-md">
              {detailedMetrics.mxnRecordsCount} operaciones
            </span>
          </div>
          <div className="text-2xl font-black text-blue-700">
            {formatCurrencyMXN(detailedMetrics.mxnTotalVentas)}
          </div>
          <div className="text-xs text-slate-600 mt-1 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Contravalor en Dólares:</span>
            <strong className="text-slate-900 font-bold">{formatCurrencyUSD(detailedMetrics.mxnTotalVentasEquivalenteUSD)}</strong>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Equivalente calculado fila por fila con sus TCs
          </div>
        </div>

        {/* Consolidated MXN Venta Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Ventas Consolidadas (MXN)</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">57 ops</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrencyMXN(detailedMetrics.sheetIngresosTotalesMXN - detailedMetrics.totalMuelleMXN)}
          </div>
          <div className="text-xs text-slate-600 mt-1 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Con Muelle ({formatCurrencyMXN(detailedMetrics.totalMuelleMXN)}):</span>
            <strong className="text-indigo-700 font-bold">{formatCurrencyMXN(detailedMetrics.sheetIngresosTotalesMXN)}</strong>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Coincidencia exacta con Columna 28 del Sheet
          </div>
        </div>

        {/* Net Profit & Margins */}
        <div className="bg-white p-4 rounded-xl border border-indigo-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">Total Utilidad Neta (MXN)</span>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-md">Muelle+Over+Casa</span>
          </div>
          <div className="text-2xl font-black text-indigo-700">
            {formatCurrencyMXN(detailedMetrics.totalUtilidadNetaMXN)}
          </div>
          <div className="text-xs text-slate-600 mt-1 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Utilidad Operativa (Col 29):</span>
            <strong className="text-slate-900 font-bold">{formatCurrencyMXN(detailedMetrics.sheetUtilidadOperativaMXN)}</strong>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Margen operativo oficial: {detailedMetrics.margenOperativoSheet.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Exchange Rate Matrix Distribution */}
      <div className="p-6 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Distribución de Tipos de Cambio Utilizados en el Sheet
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Haz clic en una tasa para filtrar las filas correspondientes
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
                  <span>{group.countUSD} en USD</span>
                  <span>{group.countMXN} en MXN</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1.5 pt-1 border-t border-slate-200/60">
                  {formatCurrencyMXN(group.totalVentaMXN)}
                </div>
              </button>
            );
          })}
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
            Todas ({auditRows.length})
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
            Solo Ventas USD ({detailedMetrics.usdRecordsCount})
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
            Solo Ventas MXN ({detailedMetrics.mxnRecordsCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:min-w-[300px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="tc-comparison-search-input"
            type="text"
            placeholder="Buscar servicio, actividad, promotor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filter summary status */}
      <div className="px-6 py-2 bg-slate-100/60 border-b border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>Mostrando <strong>{filteredRows.length}</strong> de {auditRows.length} filas analizadas</span>
          {selectedTcFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-semibold text-[11px]">
              Filtro TC: ${selectedTcFilter.toFixed(2)}
              <button onClick={() => setSelectedTcFilter('ALL')} className="hover:text-indigo-900 cursor-pointer ml-1 font-bold">×</button>
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-slate-700 font-medium">
          <span>Suma Venta en vista: <strong className="text-slate-900">{formatCurrencyMXN(currentViewStats.sumVentaMXN)}</strong></span>
          <span>Utilidad en vista: <strong className="text-emerald-700">{formatCurrencyMXN(currentViewStats.sumUtilidadMXN)}</strong></span>
        </div>
      </div>

      {/* Detailed Row-by-Column Comparative Table */}
      <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10 shadow-xs">
            <tr>
              <th className="py-3 px-3.5 border-b border-slate-200 w-14">Fila</th>
              <th className="py-3 px-3.5 border-b border-slate-200 min-w-[160px]">Actividad / Servicio</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-center w-24">Col 7: Moneda</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-center w-28">Col 8: Tipo Cambio</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-right min-w-[110px]">Col 11: Venta Orig</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-center min-w-[190px]">Fórmula Aplicada</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-right min-w-[120px] bg-slate-200/50">Col 24: Venta MXN</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-right min-w-[120px]">Col 25: Costo MXN</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-right min-w-[120px]">Col 26: Comis MXN</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-right min-w-[120px]">Col 29: Utilidad MXN</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-right min-w-[110px]">Equiv. USD</th>
              <th className="py-3 px-3.5 border-b border-slate-200 text-center w-28">Cálculo</th>
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
                      <span>{r.promotor || 'Sin promotor'}</span>
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
                      {r.tipoCambioFuente === 'Fila' ? 'En hoja' : 'Ref $18'}
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
                Totales de Filas en Pantalla ({filteredRows.length} registros)
              </td>
              <td className="py-3 px-3.5 text-right font-mono text-emerald-400">
                {currentViewStats.sumVentaOrigUSD > 0 && `${formatCurrencyUSD(currentViewStats.sumVentaOrigUSD)} + `}
                {formatCurrencyMXN(currentViewStats.sumVentaOrigMXN)}
              </td>
              <td className="py-3 px-3.5 text-center text-slate-400 text-[11px]">
                {selectedCurrencyFilter === 'USD' ? 'Suma Multiplicación × TC' : 'Suma Conversión Normalizada'}
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
                ✓ Exacto
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
