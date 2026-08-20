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
  Anchor
} from 'lucide-react';
import { ExecutiveMetrics } from '../types/marina';
import { formatCurrencyMXN, formatPercent, formatNumber } from '../utils/formatters';

interface MetricCardsProps {
  metrics: ExecutiveMetrics;
  selectedWeek: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics, selectedWeek }) => {
  return (
    <div className="space-y-4">
      {/* Week Title & Scope banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-[#002147] tracking-tight flex items-center gap-2">
            <span>Indicadores Financieros & Operativos</span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#00A3E0]/15 text-[#007ba8] border border-[#00A3E0]/30">
              {selectedWeek === 'ALL' ? 'Acumulado Total' : `Semana ${selectedWeek}`}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Valores consolidados y normalizados a Pesos Mexicanos (MXN)
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#002147]">{metrics.totalOperaciones}</span>
            <span>Operaciones</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#002147]">{metrics.totalPax}</span>
            <span>PAX Total</span>
          </div>
        </div>
      </div>

      {/* Grid of 6 Key KPI Cards matching Professional Polish style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* KPI 1: Total Venta / Ingresos */}
        <div id="card-kpi-ingresos" className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Ingresos Totales
          </p>
          <div className="text-xl font-bold text-slate-900 tracking-tight">
            {formatCurrencyMXN(metrics.totalIngresosMXN)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>Muellaje inc:</span>
            <span className="font-bold text-emerald-600 font-mono">
              +{formatCurrencyMXN(metrics.totalIngresoMuelleMXN)}
            </span>
          </div>
        </div>

        {/* KPI 2: Costos Proveedor */}
        <div id="card-kpi-costos" className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Costos Directos
          </p>
          <div className="text-xl font-bold text-rose-700 tracking-tight">
            {formatCurrencyMXN(metrics.totalCostosDirectosMXN)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>Incluye Over:</span>
            <span className="font-medium text-slate-700">Subtotal Neto</span>
          </div>
        </div>

        {/* KPI 3: Utilidad Operativa */}
        <div id="card-kpi-utilidad" className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Utilidad Operativa
          </p>
          <div className="text-xl font-bold text-[#00A3E0] tracking-tight">
            {formatCurrencyMXN(metrics.totalUtilidadOperativaMXN)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>Margen Global:</span>
            <span className="font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded text-[10px] uppercase">
              {formatPercent(metrics.margenOperativoPromedio)}
            </span>
          </div>
        </div>

        {/* KPI 4: Comisiones & Casa */}
        <div id="card-kpi-comisiones" className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Comisión Neta
          </p>
          <div className="text-xl font-bold text-slate-900 tracking-tight">
            {formatCurrencyMXN(metrics.totalComisionesMXN)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>Utilidad Casa:</span>
            <span className="font-bold text-[#002147]">
              {formatCurrencyMXN(metrics.totalCasaMXN)}
            </span>
          </div>
        </div>

        {/* KPI 5: Cobranza & Pendiente */}
        <div id="card-kpi-cobranza" className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Cobranza
          </p>
          <div className="text-xl font-bold text-slate-900 tracking-tight">
            {formatCurrencyMXN(metrics.totalVentasDepositadasMXN)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>Saldo x Cobrar:</span>
            <span className="font-bold text-amber-700">
              {formatCurrencyMXN(metrics.totalSaldoPendienteMXN)}
            </span>
          </div>
        </div>

        {/* KPI 6: Desglose PAX */}
        <div id="card-kpi-pax" className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total PAX
          </p>
          <div className="text-xl font-bold text-slate-900 tracking-tight flex items-baseline gap-1.5">
            <span>{formatNumber(metrics.totalPax)}</span>
            <span className="text-xs font-normal text-slate-400">personas</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5 font-medium">
            <span className="text-slate-700 font-bold">{metrics.totalAdultos} Ad</span>
            <span className="text-slate-300">•</span>
            <span className="text-sky-700 font-semibold">{metrics.totalNinos} Ni</span>
            <span className="text-slate-300">•</span>
            <span className="text-purple-700 font-semibold">{metrics.totalInfantes} In</span>
          </div>
        </div>
      </div>
    </div>
  );
};
