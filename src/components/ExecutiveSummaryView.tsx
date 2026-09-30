import React, { useState } from 'react';
import { 
  FileDown, 
  TrendingUp, 
  Ship, 
  Building2, 
  CheckCircle2, 
  Loader2
} from 'lucide-react';
import { 
  ExecutiveMetrics, 
  ActivitySummary, 
  LocationSummary, 
  DetailedFinancialMetrics,
  OperationRecord,
  FilterState,
  WeeklyTrend
} from '../types/marina';
import { formatCurrencyMXN, formatPercent, formatNumber } from '../utils/formatters';
import { generateExecutivePdf } from '../services/executivePdfService';
import { useLanguage } from '../context/LanguageContext';

interface ExecutiveSummaryViewProps {
  metrics: ExecutiveMetrics;
  detailedMetrics?: DetailedFinancialMetrics;
  records?: OperationRecord[];
  activitiesSummary: ActivitySummary[];
  locationsSummary: LocationSummary[];
  selectedWeek: string;
  filters?: FilterState;
  weeklyTrends?: WeeklyTrend[];
  onOpenReconciliation?: () => void;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({
  metrics,
  detailedMetrics,
  records,
  activitiesSummary,
  locationsSummary,
  selectedWeek,
  filters
}) => {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    setPdfError(null);
    setPdfSuccess(false);

    try {
      await generateExecutivePdf({
        metrics,
        detailedMetrics,
        records: records || [],
        activitiesSummary,
        locationsSummary,
        selectedWeek,
        filters,
        language,
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err) {
      console.error('Error generating executive PDF:', err);
      setPdfError(err instanceof Error ? err.message : (isEn ? 'Error generating PDF report' : 'Error al generar el reporte en PDF'));
      setTimeout(() => setPdfError(null), 5000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* PDF Error Alert if any */}
      {pdfError && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 p-3.5 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <span>{pdfError}</span>
          <button 
            onClick={() => setPdfError(null)} 
            className="text-rose-500 font-bold ml-2 text-sm hover:underline cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner matching Sheet format */}
      <div className="bg-[#002147] dark:bg-[#001733] text-white p-6 rounded-2xl border border-white/10 dark:border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono bg-[#001733] dark:bg-black/40 text-sky-200 border border-[#00A3E0]/30 px-2.5 py-0.5 rounded uppercase tracking-wider font-bold">
                {isEn ? 'Official Consolidated Report' : 'Reporte Oficial Consolidado'}
              </span>
              <span className="text-xs text-slate-300">
                {selectedWeek === 'ALL'
                  ? (isEn ? `All Weeks (${new Date().getFullYear()})` : `Todas las Semanas (${new Date().getFullYear()})`)
                  : (isEn ? `Week ${selectedWeek} (${new Date().getFullYear()})` : `Semana ${selectedWeek} (${new Date().getFullYear()})`)}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight font-sans">
              {isEn ? 'EXECUTIVE DASHBOARD — MARINA' : 'DASHBOARD EJECUTIVO — MARINA'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {isEn
                ? 'Corporate operational summary based on weekly report | Amounts normalized to MXN'
                : 'Resumen corporativo basado en el reporte semanal | Importes normalizados a MXN'}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <div className="bg-[#001733] dark:bg-black/40 px-4 py-2.5 rounded-xl border border-[#00A3E0]/20 text-right">
              <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider block">
                {isEn ? 'Overall Operating Margin' : 'Margen Operativo Global'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#00A3E0] font-mono">
                {formatPercent(metrics.margenOperativoPromedio)}
              </span>
            </div>

            {/* Generar PDF Ejecutivo Button */}
            <button
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                pdfSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#00A3E0] hover:bg-[#008ec4] active:scale-95 text-white'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
              title={isEn ? 'Download formal executive PDF with current metrics' : 'Descargar reporte formal en PDF con la vista y métricas actuales'}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{t.downloadingPdf}</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{isEn ? 'PDF Generated!' : '¡PDF Generado!'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-white" />
                  <span>{t.downloadPdfButton}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Top 6 Standard Executive KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Box 1: Ingresos Totales */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            {t.cardRevenueTitle}
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-white font-mono block">
            {formatCurrencyMXN(metrics.totalIngresosMXN)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isEn ? 'Sales + Dock Fees' : 'Venta + Muellaje'}
          </span>
        </div>

        {/* Box 2: Costos Directos */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            {isEn ? 'Direct Costs' : 'Costos Directos'}
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-white font-mono block">
            {formatCurrencyMXN(metrics.totalCostosDirectosMXN)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isEn ? 'Vendor + Over' : 'Proveedor + Over'}
          </span>
        </div>

        {/* Box 3: Comisiones */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            {isEn ? 'Commissions (50%)' : 'Comisiones (50%)'}
          </span>
          <span className="text-lg font-black text-amber-700 dark:text-amber-400 font-mono block">
            {formatCurrencyMXN(metrics.totalComisionesMXN)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isEn ? 'Sales Team' : 'Vendedores'}
          </span>
        </div>

        {/* Box 4: Utilidad Operativa */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#002147] dark:text-[#38bdf8] block mb-1">
            {t.cardProfitTitle}
          </span>
          <span className="text-lg font-black text-[#002147] dark:text-[#38bdf8] font-mono block">
            {formatCurrencyMXN(metrics.totalUtilidadOperativaMXN)}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            {isEn ? 'Net Margin' : 'Ganancia Neta'}
          </span>
        </div>

        {/* Box 5: Margen */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            {isEn ? 'Margin %' : 'Margen %'}
          </span>
          <span className="text-lg font-black text-cyan-700 dark:text-cyan-400 font-mono block">
            {formatPercent(metrics.margenOperativoPromedio)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isEn ? 'Profitability' : 'Rentabilidad'}
          </span>
        </div>

        {/* Box 6: Pernotas & Muelle */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            {isEn ? 'Overnight & Dockage' : 'Pernotas & Muelle'}
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-white font-mono block">
            {formatCurrencyMXN(metrics.totalIngresoMuelleMXN)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {metrics.totalPernotaNegativaMXN < 0 ? (
              <span className="text-slate-500 dark:text-slate-400">
                Pernota: +{formatCurrencyMXN(metrics.totalPernotaPositivaMXN)} ({formatCurrencyMXN(metrics.totalPernotaNegativaMXN)})
              </span>
            ) : (
              isEn ? 'Dock Fees & Mooring' : 'Amarre & Muellaje'
            )}
          </span>
        </div>
      </div>

      {/* Two Column Section: Resultados por Actividad & Locación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* Table 1: Resultados por Actividad */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden min-w-0">
          <div className="px-4 py-3 bg-[#002147] dark:bg-[#001733] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Ship className="w-4 h-4 text-[#00A3E0]" />
              {isEn ? 'Results by Nautical Activity' : 'Resultados por Actividad'}
            </span>
            <span className="text-[10px] font-normal text-slate-300">{isEn ? 'Breakdown' : 'Desglose'}</span>
          </div>

          <div className="overflow-x-auto w-full max-w-full overscroll-x-contain touch-pan-x min-w-0">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-2.5">{t.colActivity}</th>
                  <th className="px-3 py-2.5 text-center">{isEn ? 'Trips' : 'Ops'}</th>
                  <th className="px-3 py-2.5 text-center">PAX</th>
                  <th className="px-3 py-2.5 text-right">{isEn ? 'Revenue (MXN)' : 'Ingresos MXN'}</th>
                  <th className="px-3 py-2.5 text-right">{isEn ? 'Profit (MXN)' : 'Utilidad MXN'}</th>
                  <th className="px-3 py-2.5 text-right">{isEn ? 'Margin' : 'Margen'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {activitiesSummary.map(act => (
                  <tr key={act.actividad} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white">{act.actividad}</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-700 dark:text-slate-300">{act.operaciones}</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-700 dark:text-slate-300">{act.pax}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-medium text-slate-900 dark:text-white">
                      {formatCurrencyMXN(act.ingresosMXN)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrencyMXN(act.utilidadMXN)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-[#007ba8] dark:text-[#38bdf8]">
                      {formatPercent(act.margen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Resultados por Locación */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden min-w-0">
          <div className="px-4 py-3 bg-[#002147] dark:bg-[#001733] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#00A3E0]" />
              {isEn ? 'Results by Sales Location' : 'Resultados por Locación'}
            </span>
            <span className="text-[10px] font-normal text-slate-300">{isEn ? 'Points of Sale' : 'Puntos de Venta'}</span>
          </div>

          <div className="overflow-x-auto w-full max-w-full overscroll-x-contain touch-pan-x min-w-0">
            <table className="w-full text-left text-xs min-w-[460px]">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-2.5">{t.colLocation}</th>
                  <th className="px-3 py-2.5 text-center">{isEn ? 'Trips' : 'Ops'}</th>
                  <th className="px-3 py-2.5 text-right">{isEn ? 'Revenue (MXN)' : 'Ingresos MXN'}</th>
                  <th className="px-3 py-2.5 text-right">{isEn ? 'Profit (MXN)' : 'Utilidad MXN'}</th>
                  <th className="px-3 py-2.5 text-right">{isEn ? 'Margin' : 'Margen'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {locationsSummary.map(loc => (
                  <tr key={loc.locacion} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white">{loc.locacion}</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-700 dark:text-slate-300">{loc.operaciones}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-medium text-slate-900 dark:text-white">
                      {formatCurrencyMXN(loc.ingresosMXN)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrencyMXN(loc.utilidadMXN)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-[#007ba8] dark:text-[#38bdf8]">
                      {formatPercent(loc.margen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row: Control de Operación + Fórmulas de Negocio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Control de Operación */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00A3E0]" />
            {isEn ? 'Operations & Collections Control' : 'Control de Operación & Cobranza'}
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-slate-600 dark:text-slate-400">{isEn ? 'Recorded Departures' : 'Operaciones Registradas'}</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{metrics.totalOperaciones}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-slate-600 dark:text-slate-400">{isEn ? 'Passengers Served (PAX)' : 'PAX Atendidos (Pasajeros)'}</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                {metrics.totalPax} {isEn ? 'passengers' : 'personas'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-slate-600 dark:text-slate-400">{isEn ? 'Deposits Paid (Cash/Card in Bank)' : 'Ventas Depositadas (Cobro Efectivo)'}</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                {formatCurrencyMXN(metrics.totalVentasDepositadasMXN)}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-slate-600 dark:text-slate-400">{isEn ? 'Settled Operations' : 'Operaciones Liquidadas'}</span>
              <span className="font-bold text-[#00A3E0] font-mono text-sm">{metrics.operacionesLiquidadas}</span>
            </div>
          </div>
        </div>

        {/* Cómo se calcula la ganancia (Fórmulas oficiales) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl border border-slate-800 p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 pb-2 border-b border-slate-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            {isEn ? 'Official Profit & Margin Formulas' : 'Fórmulas Oficiales de Ganancia & Rentabilidad'}
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                {isEn ? 'Total Revenue:' : 'Ingresos Totales:'}
              </span>
              <code className="text-cyan-300 font-mono text-[11px] block">
                {isEn ? 'Total Revenue = Sales + Dockage + Overnight Fees' : 'Ingresos Totales = Venta + Muelle + Pernota'}
              </code>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                {isEn ? 'Operating Profit:' : 'Utilidad Operativa:'}
              </span>
              <code className="text-sky-300 font-mono text-[11px] block">
                {isEn
                  ? 'Operating Profit = Total Revenue − Vendor Cost (with Over) − Promoter Commission'
                  : 'Utilidad Operativa = Ingresos Totales − Costo Proveedor (con Over) − Comisión Vendedor'}
              </code>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                {isEn ? 'Operating Margin:' : 'Margen Operativo:'}
              </span>
              <code className="text-amber-300 font-mono text-[11px] block">
                {isEn
                  ? 'Margin % = (Operating Profit / Total Revenue) × 100'
                  : 'Margen % = (Utilidad Operativa / Ingresos Totales) × 100'}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
