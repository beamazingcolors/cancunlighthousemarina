import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { 
  ActivitySummary, 
  LocationSummary, 
  PromoterSummary, 
  WeeklyTrend,
  ExecutiveMetrics
} from '../types/marina';
import { formatCurrencyMXN, formatPercent, formatNumber } from '../utils/formatters';

interface AnalyticsChartsProps {
  activitiesData: ActivitySummary[];
  locationsData: LocationSummary[];
  promotersData: PromoterSummary[];
  weeklyData: WeeklyTrend[];
  metrics: ExecutiveMetrics;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  activitiesData,
  locationsData,
  promotersData,
  weeklyData,
  metrics
}) => {
  // Data for PAX Pie Chart
  const paxPieData = [
    { name: 'Adultos', value: metrics.totalAdultos, color: '#002147' },
    { name: 'Niños (Menores)', value: metrics.totalNinos, color: '#00A3E0' },
    { name: 'Infantes', value: metrics.totalInfantes, color: '#8b5cf6' }
  ].filter(d => d.value > 0);

  // Data for Collection Status Pie
  const collectionPieData = [
    { name: 'Ventas Depositadas', value: metrics.totalVentasDepositadasMXN, color: '#10b981' },
    { name: 'Saldo Pendiente x Cobrar', value: metrics.totalSaldoPendienteMXN, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Row: Activity Breakdown + Location Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Desempeño Financiero por Actividad */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#002147] tracking-tight">
                Resultados por Tipo de Actividad
              </h3>
              <p className="text-xs text-slate-500">
                Comparativa de Ingresos vs Costos y Utilidad Operativa en MXN
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {activitiesData.length} Categorías
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activitiesData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="actividad" 
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrencyMXN(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#002147', borderRadius: '8px', border: '1px solid #001733', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="ingresosMXN" name="Ingresos Totales" fill="#002147" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costosMXN" name="Costos Directos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="utilidadMXN" name="Utilidad Operativa" fill="#00A3E0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats Grid under Activity Chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100">
            {activitiesData.slice(0, 4).map((act) => (
              <div key={act.actividad} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{act.actividad}</span>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1 rounded">
                    {formatPercent(act.margen)}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1 font-mono">
                  {formatCurrencyMXN(act.ingresosMXN)}
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between mt-0.5">
                  <span>{act.operaciones} ops</span>
                  <span>{act.pax} PAX</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Comparativa por Locación */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#002147] tracking-tight">
                Rendimiento por Locación de Venta
              </h3>
              <p className="text-xs text-slate-500">
                Distribución de volumen y márgenes entre puntos de venta
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#007ba8] bg-[#00A3E0]/15 px-2 py-0.5 rounded border border-[#00A3E0]/30">
              Lighthouse vs Fashion Harbor
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationsData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="locacion" 
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrencyMXN(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#002147', borderRadius: '8px', border: '1px solid #001733', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="ingresosMXN" name="Ingresos MXN" fill="#002147" radius={[4, 4, 0, 0]} />
                <Bar dataKey="utilidadMXN" name="Utilidad Neta MXN" fill="#00A3E0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Location Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
            {locationsData.map((loc) => (
              <div key={loc.locacion} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">{loc.locacion}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Margen: {formatPercent(loc.margen)}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  {formatCurrencyMXN(loc.ingresosMXN)}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>{loc.operaciones} Operaciones</span>
                  <span>{loc.pax} PAX</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Weekly Trend Evolution */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#002147] tracking-tight">
              Evolución Semanal de Operaciones & Utilidades
            </h3>
            <p className="text-xs text-slate-500">
              Tendencia de Ingresos Totales, Utilidad Operativa y Recaudación de Muellaje por Semana del Año
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500">Total Semanas:</span>
            <span className="font-bold text-[#002147]">{weeklyData.length}</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={weeklyData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="semana" 
                tick={{ fill: '#475569', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(val) => `${val} pax`}
              />
              <Tooltip 
                formatter={(value: any, name: any) => [
                  name === 'PAX Atendidos' ? `${value} personas` : formatCurrencyMXN(Number(value)),
                  name
                ]}
                contentStyle={{ backgroundColor: '#002147', borderRadius: '8px', border: '1px solid #001733', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="ingresosMXN" name="Ingresos Totales" fill="#002147" radius={[4, 4, 0, 0]} barSize={26} />
              <Bar yAxisId="left" dataKey="utilidadMXN" name="Utilidad Operativa" fill="#00A3E0" radius={[4, 4, 0, 0]} barSize={26} />
              <Line yAxisId="right" type="monotone" dataKey="pax" name="PAX Atendidos" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
              <Line yAxisId="left" type="monotone" dataKey="muelleMXN" name="Ingreso Muellaje" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: PAX Demographics + Top Promoters + Cobranza Mix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PAX Mix Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-[#002147] mb-1">
            Composición de Pasajeros (PAX)
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Desglose de Adultos, Niños e Infantes
          </p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paxPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paxPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${val} pasajeros`, 'Cantidad']}
                  contentStyle={{ backgroundColor: '#002147', borderRadius: '8px', border: '1px solid #001733', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#002147]" />
                <span className="text-slate-700">Adultos</span>
              </span>
              <span className="font-bold text-slate-900 font-mono">{metrics.totalAdultos} pax</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#00A3E0]" />
                <span className="text-slate-700">Niños (Menores)</span>
              </span>
              <span className="font-bold text-slate-900 font-mono">{metrics.totalNinos} pax</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-slate-700">Infantes</span>
              </span>
              <span className="font-bold text-slate-900 font-mono">{metrics.totalInfantes} pax</span>
            </div>
          </div>
        </div>

        {/* Top Promoters */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-[#002147] mb-1">
            Top Promotores / Vendedores
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Ventas realizadas y comisiones asignadas
          </p>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {promotersData.slice(0, 6).map((prom, index) => (
              <div key={prom.promotor} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#002147] text-white font-bold text-[10px] flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                      {prom.promotor}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {prom.operaciones} {prom.operaciones === 1 ? 'operación' : 'operaciones'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    {formatCurrencyMXN(prom.ventasMXN)}
                  </div>
                  <div className="text-[10px] text-amber-700 font-medium font-mono">
                    Com: {formatCurrencyMXN(prom.comisionMXN)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cobranza Status & Audit */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-[#002147] mb-1">
            Estado de Cobranza & Depósitos
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Proporción de cobro anticipado vs saldo pendiente
          </p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={collectionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {collectionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [formatCurrencyMXN(Number(val)), '']}
                  contentStyle={{ backgroundColor: '#002147', borderRadius: '8px', border: '1px solid #001733', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-700">Depósito Cobrado</span>
              </span>
              <span className="font-bold text-emerald-700 font-mono">
                {formatCurrencyMXN(metrics.totalVentasDepositadasMXN)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-700">Saldo Pendiente (Balance)</span>
              </span>
              <span className="font-bold text-amber-700 font-mono">
                {formatCurrencyMXN(metrics.totalSaldoPendienteMXN)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-600 font-medium">Tasa de Cobranza:</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] border border-slate-200">
                {formatPercent(metrics.tasaCobranza)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
