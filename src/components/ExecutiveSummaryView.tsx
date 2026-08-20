import React from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  HelpCircle, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Users, 
  Ship, 
  Anchor
} from 'lucide-react';
import { 
  ExecutiveMetrics, 
  ActivitySummary, 
  LocationSummary 
} from '../types/marina';
import { formatCurrencyMXN, formatPercent, formatNumber } from '../utils/formatters';

interface ExecutiveSummaryViewProps {
  metrics: ExecutiveMetrics;
  activitiesSummary: ActivitySummary[];
  locationsSummary: LocationSummary[];
  selectedWeek: string;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({
  metrics,
  activitiesSummary,
  locationsSummary,
  selectedWeek
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner matching Sheet format */}
      <div className="bg-[#002147] text-white p-6 rounded-2xl border border-[#001733] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono bg-[#001733] text-sky-200 border border-[#00A3E0]/30 px-2.5 py-0.5 rounded uppercase tracking-wider font-bold">
                Reporte Oficial Consolidado
              </span>
              <span className="text-xs text-slate-300">
                {selectedWeek === 'ALL' ? 'Todas las Semanas' : `Semana ${selectedWeek}`}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
              DASHBOARD EJECUTIVO — MARINA
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Resumen corporativo basado en el reporte semanal | Importes normalizados a MXN
            </p>
          </div>

          <div className="bg-[#001733] px-4 py-3 rounded-xl border border-[#00A3E0]/20 text-right">
            <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider block">Margen Operativo Global</span>
            <span className="text-2xl font-black text-[#00A3E0] font-mono">
              {formatPercent(metrics.margenOperativoPromedio)}
            </span>
          </div>
        </div>
      </div>

      {/* Top 6 Standard Executive KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Box 1: Ingresos Totales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Ingresos Totales
          </span>
          <span className="text-lg font-black text-slate-900 font-mono block">
            {formatCurrencyMXN(metrics.totalIngresosMXN)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Venta + Muellaje</span>
        </div>

        {/* Box 2: Costos Directos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Costos Directos
          </span>
          <span className="text-lg font-black text-rose-700 font-mono block">
            {formatCurrencyMXN(metrics.totalCostosDirectosMXN)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Proveedor + Over</span>
        </div>

        {/* Box 3: Comisiones */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Comisiones
          </span>
          <span className="text-lg font-black text-amber-700 font-mono block">
            {formatCurrencyMXN(metrics.totalComisionesMXN)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Vendedores</span>
        </div>

        {/* Box 4: Utilidad Operativa */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs bg-emerald-50/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block mb-1">
            Utilidad Operativa
          </span>
          <span className="text-lg font-black text-emerald-700 font-mono block">
            {formatCurrencyMXN(metrics.totalUtilidadOperativaMXN)}
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 block">Ganancia Neta</span>
        </div>

        {/* Box 5: Margen */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Margen %
          </span>
          <span className="text-lg font-black text-cyan-800 font-mono block">
            {formatPercent(metrics.margenOperativoPromedio)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Rentabilidad</span>
        </div>

        {/* Box 6: Saldo Pendiente */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Saldo Pendiente
          </span>
          <span className="text-lg font-black text-amber-600 font-mono block">
            {formatCurrencyMXN(metrics.totalSaldoPendienteMXN)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Por cobrar</span>
        </div>
      </div>

      {/* Two Column Section: Resultados por Actividad & Locación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Resultados por Actividad */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-[#002147] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Ship className="w-4 h-4 text-[#00A3E0]" />
              Resultados por Actividad
            </span>
            <span className="text-[10px] font-normal text-slate-300">Desglose</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Actividad</th>
                  <th className="px-3 py-2.5 text-center">Ops</th>
                  <th className="px-3 py-2.5 text-center">PAX</th>
                  <th className="px-3 py-2.5 text-right">Ingresos MXN</th>
                  <th className="px-3 py-2.5 text-right">Utilidad MXN</th>
                  <th className="px-3 py-2.5 text-right">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activitiesSummary.map(act => (
                  <tr key={act.actividad} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-bold text-slate-900">{act.actividad}</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-700">{act.operaciones}</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-700">{act.pax}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-medium text-slate-900">
                      {formatCurrencyMXN(act.ingresosMXN)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700">
                      {formatCurrencyMXN(act.utilidadMXN)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-[#007ba8]">
                      {formatPercent(act.margen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Resultados por Locación */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-[#002147] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#00A3E0]" />
              Resultados por Locación
            </span>
            <span className="text-[10px] font-normal text-slate-300">Puntos de Venta</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Locación</th>
                  <th className="px-3 py-2.5 text-center">Ops</th>
                  <th className="px-3 py-2.5 text-right">Ingresos MXN</th>
                  <th className="px-3 py-2.5 text-right">Utilidad MXN</th>
                  <th className="px-3 py-2.5 text-right">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locationsSummary.map(loc => (
                  <tr key={loc.locacion} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-bold text-slate-900">{loc.locacion}</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-700">{loc.operaciones}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-medium text-slate-900">
                      {formatCurrencyMXN(loc.ingresosMXN)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700">
                      {formatCurrencyMXN(loc.utilidadMXN)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-[#007ba8]">
                      {formatPercent(loc.margen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row: Control de Cobranza + Fórmulas de Negocio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Control de Cobranza y Operación */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Control de Cobranza y Operación
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Operaciones Registradas</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{metrics.totalOperaciones}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-600">PAX Atendidos (Pasajeros)</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{metrics.totalPax} personas</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Ventas Depositadas (Cobro Efectivo)</span>
              <span className="font-bold text-emerald-700 font-mono text-sm">
                {formatCurrencyMXN(metrics.totalVentasDepositadasMXN)}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Operaciones Pendientes de Liquidar</span>
              <span className="font-bold text-amber-700 font-mono text-sm">{metrics.operacionesPendientes}</span>
            </div>
          </div>
        </div>

        {/* Cómo se calcula la ganancia (Fórmulas oficiales) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl border border-slate-800 p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 pb-2 border-b border-slate-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Fórmulas Oficiales de Ganancia & Rentabilidad
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Ingresos Totales:</span>
              <code className="text-cyan-300 font-mono text-[11px] block">
                Ingresos Totales = Venta + Ingreso de Muelle
              </code>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Utilidad Operativa:</span>
              <code className="text-emerald-300 font-mono text-[11px] block">
                Utilidad Operativa = Ingresos Totales − Costo Proveedor (con Over) − Comisión Vendedor
              </code>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Margen Operativo:</span>
              <code className="text-amber-300 font-mono text-[11px] block">
                Margen % = (Utilidad Operativa / Ingresos Totales) × 100
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
