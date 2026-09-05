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
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridStroke = isDark ? '#1e293b' : '#f1f5f9';
  const axisColor = isDark ? '#94a3b8' : '#475569';
  const tooltipBg = isDark ? '#0f172a' : '#002147';
  const tooltipBorder = isDark ? '#334155' : '#001733';

  // Data for PAX Pie Chart
  const paxPieData = [
    { name: 'Adultos', value: metrics.totalAdultos, color: isDark ? '#38bdf8' : '#002147' },
    { name: 'Niños (Menores)', value: metrics.totalNinos, color: '#00A3E0' },
    { name: 'Infantes', value: metrics.totalInfantes, color: isDark ? '#a78bfa' : '#7c3aed' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Top Row: Activity Breakdown + Location Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* Chart 1: Desempeño Financiero por Actividad */}
        <div className="bg-white dark:bg-[#0b1728] rounded-xl p-4 sm:p-5 border border-sky-100 dark:border-[#162a4a] shadow-xs min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-sky-50 dark:border-[#162a4a]/80">
            <div>
              <h3 className="text-sm font-bold text-[#002147] dark:text-[#7cd1ff] tracking-tight">
                Resultados por Tipo de Actividad
              </h3>
              <p className="text-xs text-slate-500 dark:text-sky-200/60">
                Comparativa de Ingresos vs Costos y Utilidad Operativa en MXN
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#004b75] dark:text-sky-300 bg-sky-50 dark:bg-[#0f233d] px-2 py-0.5 rounded border border-sky-200 dark:border-[#1e3e68] self-start sm:self-auto">
              {activitiesData.length} Categorías
            </span>
          </div>

          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activitiesData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis 
                  dataKey="actividad" 
                  tick={{ fill: axisColor, fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: isDark ? '#1e3a5f' : '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fill: axisColor, fontSize: 10 }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  axisLine={{ stroke: isDark ? '#1e3a5f' : '#cbd5e1' }}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrencyMXN(Number(value)), '']}
                  contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="ingresosMXN" name="Ingresos Totales" fill={isDark ? '#38bdf8' : '#002147'} radius={[4, 4, 0, 0]} />
                <Bar dataKey="costosMXN" name="Costos Directos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="utilidadMXN" name="Utilidad Operativa" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats Grid under Activity Chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-sky-50 dark:border-[#162a4a]/80">
            {activitiesData.slice(0, 4).map((act) => (
              <div key={act.actividad} className="bg-sky-50/50 dark:bg-[#071220] p-2.5 rounded-lg border border-sky-100 dark:border-[#162a4a] min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-sky-100 truncate">{act.actividad}</span>
                  <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 bg-sky-100/70 dark:bg-[#0f233d] px-1 rounded flex-shrink-0">
                    {formatPercent(act.margen)}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 font-mono truncate">
                  {formatCurrencyMXN(act.ingresosMXN)}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-sky-200/60 flex justify-between mt-0.5">
                  <span>{act.operaciones} ops</span>
                  <span>{act.pax} PAX</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Comparativa por Locación */}
        <div className="bg-white dark:bg-[#0b1728] rounded-xl p-4 sm:p-5 border border-sky-100 dark:border-[#162a4a] shadow-xs min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-sky-50 dark:border-[#162a4a]/80">
            <div>
              <h3 className="text-sm font-bold text-[#002147] dark:text-[#7cd1ff] tracking-tight">
                Rendimiento por Locación de Venta
              </h3>
              <p className="text-xs text-slate-500 dark:text-sky-200/60">
                Distribución de volumen y márgenes entre puntos de venta
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#004b75] dark:text-sky-300 bg-sky-50 dark:bg-[#0f233d] px-2 py-0.5 rounded border border-sky-200 dark:border-[#1e3e68] self-start sm:self-auto">
              Lighthouse vs Fashion Harbor
            </span>
          </div>

          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationsData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis 
                  dataKey="locacion" 
                  tick={{ fill: axisColor, fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: isDark ? '#1e3a5f' : '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fill: axisColor, fontSize: 10 }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  axisLine={{ stroke: isDark ? '#1e3a5f' : '#cbd5e1' }}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrencyMXN(Number(value)), '']}
                  contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="ingresosMXN" name="Ingresos MXN" fill={isDark ? '#38bdf8' : '#002147'} radius={[4, 4, 0, 0]} />
                <Bar dataKey="utilidadMXN" name="Utilidad Neta MXN" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Location Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-sky-50 dark:border-[#162a4a]/80">
            {locationsData.map((loc) => (
              <div key={loc.locacion} className="bg-sky-50/50 dark:bg-[#071220] p-3 rounded-lg border border-sky-100 dark:border-[#162a4a] min-w-0">
                <div className="flex items-center justify-between mb-1 gap-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-sky-100 truncate">{loc.locacion}</span>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                    Margen: {formatPercent(loc.margen)}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">
                  {formatCurrencyMXN(loc.ingresosMXN)}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-sky-200/60 mt-1">
                  <span>{loc.operaciones} Operaciones</span>
                  <span>{loc.pax} PAX</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Weekly Trend Evolution */}
      <div className="bg-white dark:bg-[#0b1728] rounded-xl p-4 sm:p-5 border border-sky-100 dark:border-[#162a4a] shadow-xs min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-sky-50 dark:border-[#162a4a]/80">
          <div>
            <h3 className="text-sm font-bold text-[#002147] dark:text-[#7cd1ff] tracking-tight">
              Evolución Semanal de Operaciones & Utilidades
            </h3>
            <p className="text-xs text-slate-500 dark:text-sky-200/60">
              Tendencia de Ingresos Totales, Utilidad Operativa y Recaudación de Muellaje por Semana ({new Date().getFullYear()})
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs self-start sm:self-auto">
            <span className="text-slate-500 dark:text-sky-200/70">Total Semanas:</span>
            <span className="font-bold text-[#002147] dark:text-[#7cd1ff] bg-sky-50 dark:bg-[#0f233d] px-2 py-0.5 rounded border border-sky-200 dark:border-[#1e3e68]">{weeklyData.length}</span>
          </div>
        </div>

        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis 
                dataKey="semana" 
                tick={{ fill: axisColor, fontSize: 10 }}
                axisLine={{ stroke: isDark ? '#1e3a5f' : '#cbd5e1' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fill: axisColor, fontSize: 10 }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                axisLine={{ stroke: isDark ? '#1e3a5f' : '#cbd5e1' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tick={{ fill: axisColor, fontSize: 10 }}
                axisLine={{ stroke: isDark ? '#1e3a5f' : '#cbd5e1' }}
                tickFormatter={(val) => `${val}p`}
              />
              <Tooltip 
                formatter={(value: any, name: any) => [
                  name === 'PAX Atendidos' ? `${value} personas` : formatCurrencyMXN(Number(value)),
                  name
                ]}
                contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="ingresosMXN" name="Ingresos Totales" fill={isDark ? '#38bdf8' : '#002147'} radius={[4, 4, 0, 0]} barSize={22} />
              <Bar yAxisId="left" dataKey="utilidadMXN" name="Utilidad Operativa" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
              <Line yAxisId="right" type="monotone" dataKey="pax" name="PAX Atendidos" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} />
              <Line yAxisId="left" type="monotone" dataKey="muelleMXN" name="Ingreso Muellaje" stroke="#00A3E0" strokeWidth={2} strokeDasharray="4 4" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: PAX Demographics + Top Promoters (Balanced 2-column aesthetic layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
        {/* PAX Mix Chart */}
        <div className="bg-white dark:bg-[#0b1728] rounded-xl p-4 sm:p-5 border border-sky-100 dark:border-[#162a4a] shadow-xs min-w-0">
          <div className="flex items-center justify-between mb-1 pb-2 border-b border-sky-50 dark:border-[#162a4a]/80">
            <div>
              <h3 className="text-sm font-bold text-[#002147] dark:text-[#7cd1ff]">
                Composición de Pasajeros (PAX)
              </h3>
              <p className="text-xs text-slate-500 dark:text-sky-200/60">
                Desglose de Adultos, Niños e Infantes
              </p>
            </div>
            <span className="text-xs font-bold text-[#002147] dark:text-sky-300 bg-sky-50 dark:bg-[#0f233d] px-2.5 py-1 rounded-lg border border-sky-200 dark:border-[#1e3e68] font-mono">
              {metrics.totalPax} PAX Total
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paxPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={82}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paxPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${val} pasajeros`, 'Cantidad']}
                  contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-sky-50 dark:border-[#162a4a]/80 text-xs text-center">
            <div className="p-2 bg-sky-50/60 dark:bg-[#071220] rounded-lg border border-sky-100 dark:border-[#162a4a]">
              <span className="flex items-center justify-center gap-1 text-[11px] text-slate-600 dark:text-sky-200 mb-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#002147] dark:bg-sky-400 inline-block" />
                Adultos
              </span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{metrics.totalAdultos}</span>
            </div>
            <div className="p-2 bg-sky-50/60 dark:bg-[#071220] rounded-lg border border-sky-100 dark:border-[#162a4a]">
              <span className="flex items-center justify-center gap-1 text-[11px] text-slate-600 dark:text-sky-200 mb-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00A3E0] inline-block" />
                Niños
              </span>
              <span className="font-bold text-[#00A3E0] font-mono text-sm">{metrics.totalNinos}</span>
            </div>
            <div className="p-2 bg-sky-50/60 dark:bg-[#071220] rounded-lg border border-sky-100 dark:border-[#162a4a]">
              <span className="flex items-center justify-center gap-1 text-[11px] text-slate-600 dark:text-sky-200 mb-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                Infantes
              </span>
              <span className="font-bold text-purple-700 dark:text-purple-400 font-mono text-sm">{metrics.totalInfantes}</span>
            </div>
          </div>
        </div>

        {/* Top Promoters */}
        <div className="bg-white dark:bg-[#0b1728] rounded-xl p-4 sm:p-5 border border-sky-100 dark:border-[#162a4a] shadow-xs min-w-0">
          <div className="flex items-center justify-between mb-1 pb-2 border-b border-sky-50 dark:border-[#162a4a]/80">
            <div>
              <h3 className="text-sm font-bold text-[#002147] dark:text-[#7cd1ff]">
                Top Promotores / Vendedores
              </h3>
              <p className="text-xs text-slate-500 dark:text-sky-200/60">
                Ventas realizadas y comisiones asignadas
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#004b75] dark:text-sky-300 bg-sky-50 dark:bg-[#0f233d] px-2 py-0.5 rounded border border-sky-200 dark:border-[#1e3e68]">
              {promotersData.length} Activos
            </span>
          </div>

          <div className="space-y-2 mt-3 max-h-72 overflow-y-auto pr-1">
            {promotersData.slice(0, 6).map((prom, index) => (
              <div key={prom.promotor} className="p-2.5 rounded-lg bg-sky-50/40 dark:bg-[#071220] border border-sky-100/80 dark:border-[#162a4a] flex items-center justify-between hover:border-sky-300 dark:hover:border-sky-600 transition-colors">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#002147] dark:bg-[#00A3E0] text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                      {prom.promotor}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-sky-200/60">
                      {prom.operaciones} {prom.operaciones === 1 ? 'operación' : 'operaciones'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    {formatCurrencyMXN(prom.ventasMXN)}
                  </div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium font-mono">
                    Com: {formatCurrencyMXN(prom.comisionMXN)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
