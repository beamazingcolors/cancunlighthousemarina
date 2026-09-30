import React, { useState } from 'react';
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
import { useLanguage } from '../context/LanguageContext';
import { Ship, Filter, CheckCircle2, Sparkles, MapPin, X, Users } from 'lucide-react';

interface AnalyticsChartsProps {
  activitiesData: ActivitySummary[];
  locationsData: LocationSummary[];
  promotersData: PromoterSummary[];
  weeklyData: WeeklyTrend[];
  metrics: ExecutiveMetrics;
  selectedActivity?: string;
  onSelectActivity?: (activity: string) => void;
  selectedLocation?: string;
  onSelectLocation?: (location: string) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  activitiesData,
  locationsData,
  promotersData,
  weeklyData,
  metrics,
  selectedActivity = 'ALL',
  onSelectActivity,
  selectedLocation = 'ALL',
  onSelectLocation
}) => {
  const { theme } = useTheme();
  const { language, l } = useLanguage();
  const isEn = language === 'en';
  const isDark = theme === 'dark';

  const gridStroke = isDark ? '#1e293b' : '#f1f5f9';
  const axisColor = isDark ? '#94a3b8' : '#475569';
  const tooltipBg = isDark ? '#0f172a' : '#002147';
  const tooltipBorder = isDark ? '#334155' : '#001733';

  // State to toggle which metrics are visible in the activity chart
  const [metricFilter, setMetricFilter] = useState<'all' | 'utilidad' | 'ingresos'>('all');

  // Data for PAX Pie Chart
  const paxPieData = [
    { name: l('Adultos', 'Adults'), value: metrics.totalAdultos, color: isDark ? '#38bdf8' : '#002147' },
    { name: l('Niños (Menores)', 'Children (Minors)'), value: metrics.totalNinos, color: '#00A3E0' },
    { name: l('Infantes', 'Infants'), value: metrics.totalInfantes, color: isDark ? '#a78bfa' : '#7c3aed' }
  ].filter(d => d.value > 0);

  // Distinct activity list for buttons
  const availableActivityNames = activitiesData.map(a => a.actividad);

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Top Row: Activity Breakdown + Location Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* Chart 1: Desempeño Financiero por Actividad (WITH FUNCTIONAL BUTTONS) */}
        <div className="bg-white dark:bg-[#0b1728] rounded-xl p-4 sm:p-5 border border-sky-100 dark:border-[#162a4a] shadow-xs min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-sky-50 dark:border-[#162a4a]/80">
              <div>
                <h3 className="text-sm font-bold text-[#002147] dark:text-[#7cd1ff] tracking-tight flex items-center gap-1.5">
                  <Ship className="w-4 h-4 text-[#00A3E0]" />
                  <span>{l('Resultados por Tipo de Actividad', 'Results by Activity Type')}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-sky-200/60">
                  {l('Haz clic en un botón (ej. Yate) para que la tabla y ganancias se filtren solo a esa actividad.', 'Click a button (e.g. Yacht) to filter the table and profits to that activity.')}
                </p>
              </div>

              {/* Metric filter buttons inside chart */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setMetricFilter('all')}
                  className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                    metricFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-[#002147] dark:text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {l('Todos', 'All')}
                </button>
                <button
                  type="button"
                  onClick={() => setMetricFilter('utilidad')}
                  className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                    metricFilter === 'utilidad'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {l('Utilidad', 'Profit')}
                </button>
                <button
                  type="button"
                  onClick={() => setMetricFilter('ingresos')}
                  className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                    metricFilter === 'ingresos'
                      ? 'bg-[#002147] dark:bg-[#00A3E0] text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {l('Ingresos', 'Revenue')}
                </button>
              </div>
            </div>

            {/* INTERACTIVE ACTIVITY SELECTOR BUTTONS */}
            <div className="flex items-center gap-1.5 flex-wrap pb-3">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3 text-[#00A3E0]" />
                {l('Filtrar tabla:', 'Filter table:')}
              </span>

              <button
                type="button"
                onClick={() => onSelectActivity && onSelectActivity('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  selectedActivity === 'ALL'
                    ? 'bg-[#002147] text-white dark:bg-[#00A3E0] shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {l('Todas', 'All')} ({activitiesData.length})
              </button>

              {availableActivityNames.map(actName => {
                const isSelected = selectedActivity.toLowerCase() === actName.toLowerCase();
                const iconEmoji = actName.toLowerCase().includes('yate') ? '⛵' 
                  : actName.toLowerCase().includes('tour') ? '🏄'
                  : actName.toLowerCase().includes('marina') ? '⚓'
                  : actName.toLowerCase().includes('pernota') ? '🚢'
                  : '✨';

                return (
                  <button
                    key={actName}
                    type="button"
                    onClick={() => onSelectActivity && onSelectActivity(actName)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#00A3E0] text-white shadow-xs scale-102 ring-2 ring-[#00A3E0]/40'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title={l(`Filtrar tabla para ver únicamente ganancias de ${actName}`, `Filter table to see profits only from ${actName}`)}
                  >
                    <span>{iconEmoji}</span>
                    <span>{actName}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Active Filter Notification Alert */}
            {selectedActivity !== 'ALL' && (
              <div className="mb-3 p-2.5 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00A3E0] animate-ping" />
                  <span className="text-[#002147] dark:text-sky-200">
                    {l('Mostrando únicamente ganancias y operaciones de:', 'Displaying profits and operations solely for:')} <strong>{selectedActivity}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectActivity && onSelectActivity('ALL')}
                  className="text-[11px] font-bold text-sky-700 dark:text-sky-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>{l('Ver todas', 'View all')}</span>
                </button>
              </div>
            )}

            {/* Chart */}
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={activitiesData} 
                  margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload.length > 0) {
                      const clickedAct = e.activePayload[0]?.payload?.actividad;
                      if (clickedAct && onSelectActivity) {
                        onSelectActivity(clickedAct);
                      }
                    }
                  }}
                >
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
                  {(metricFilter === 'all' || metricFilter === 'ingresos') && (
                    <Bar dataKey="ingresosMXN" name={l('Ingresos Totales', 'Total Revenue')} fill={isDark ? '#38bdf8' : '#002147'} radius={[4, 4, 0, 0]} cursor="pointer" />
                  )}
                  {metricFilter === 'all' && (
                    <Bar dataKey="costosMXN" name={l('Costos Directos', 'Direct Costs')} fill="#f43f5e" radius={[4, 4, 0, 0]} cursor="pointer" />
                  )}
                  {(metricFilter === 'all' || metricFilter === 'utilidad') && (
                    <Bar dataKey="utilidadMXN" name={l('Utilidad Operativa', 'Operating Profit')} fill="#10b981" radius={[4, 4, 0, 0]} cursor="pointer" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats Grid under Activity Chart - ACTS AS BUTTONS TOO */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-sky-50 dark:border-[#162a4a]/80">
            {activitiesData.slice(0, 4).map((act) => {
              const isSelected = selectedActivity.toLowerCase() === act.actividad.toLowerCase();
              return (
                <button
                  key={act.actividad}
                  type="button"
                  onClick={() => onSelectActivity && onSelectActivity(act.actividad)}
                  className={`text-left p-2.5 rounded-lg border transition cursor-pointer ${
                    isSelected 
                      ? 'bg-[#00A3E0]/15 border-[#00A3E0] dark:bg-[#00A3E0]/20'
                      : 'bg-sky-50/50 dark:bg-[#071220] border-sky-100 dark:border-[#162a4a] hover:border-sky-300'
                  }`}
                  title={l(`Clic para filtrar ganancias de ${act.actividad}`, `Click to filter profits from ${act.actividad}`)}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-sky-100 truncate flex items-center gap-1">
                      {act.actividad}
                    </span>
                    <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 bg-sky-100/70 dark:bg-[#0f233d] px-1 rounded flex-shrink-0">
                      {formatPercent(act.margen)}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 font-mono truncate">
                    {formatCurrencyMXN(act.ingresosMXN)}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-sky-200/60 flex justify-between mt-0.5">
                    <span>{act.operaciones} {l('ops', 'trips')}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{formatCurrencyMXN(act.utilidadMXN)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Comparativa por Locación */}
        <div className="bg-white dark:bg-[#0b1728] rounded-xl p-4 sm:p-5 border border-sky-100 dark:border-[#162a4a] shadow-xs min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-sky-50 dark:border-[#162a4a]/80">
              <div>
                <h3 className="text-sm font-bold text-[#002147] dark:text-[#7cd1ff] tracking-tight flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#00A3E0]" />
                  <span>{l('Rendimiento por Locación de Venta', 'Performance by Sales Location')}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-sky-200/60">
                  {l('Distribución de volumen y márgenes entre puntos de venta', 'Volume and margin distribution across points of sale')}
                </p>
              </div>

              {/* Location filter buttons */}
              {onSelectLocation && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => onSelectLocation('ALL')}
                    className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                      selectedLocation === 'ALL'
                        ? 'bg-[#002147] text-white dark:bg-[#00A3E0] font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {l('Todas', 'All')}
                  </button>
                  {locationsData.map(loc => (
                    <button
                      key={loc.locacion}
                      type="button"
                      onClick={() => onSelectLocation(loc.locacion)}
                      className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                        selectedLocation === loc.locacion
                          ? 'bg-[#002147] text-white dark:bg-[#00A3E0] font-bold shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {loc.locacion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-64 w-full min-w-0">
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
                  <Bar dataKey="ingresosMXN" name={l('Ingresos MXN', 'Revenue MXN')} fill={isDark ? '#38bdf8' : '#002147'} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="utilidadMXN" name={l('Utilidad Neta MXN', 'Net Profit MXN')} fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Location Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-sky-50 dark:border-[#162a4a]/80">
            {locationsData.map((loc) => (
              <div 
                key={loc.locacion} 
                onClick={() => onSelectLocation && onSelectLocation(loc.locacion)}
                className="bg-sky-50/50 dark:bg-[#071220] p-3 rounded-lg border border-sky-100 dark:border-[#162a4a] min-w-0 hover:border-[#00A3E0] transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1 gap-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-sky-100 truncate">{loc.locacion}</span>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                    {l('Margen', 'Margin')}: {formatPercent(loc.margen)}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">
                  {formatCurrencyMXN(loc.ingresosMXN)}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-sky-200/60 mt-1">
                  <span>{loc.operaciones} {l('Operaciones', 'Operations')}</span>
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
              {l('Evolución Semanal de Operaciones & Utilidades', 'Weekly Evolution of Operations & Profits')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-sky-200/60">
              {l(`Tendencia de Ingresos Totales, Utilidad Operativa y Recaudación de Muellaje por Semana (${new Date().getFullYear()})`, `Trend of Total Revenue, Operating Profit, and Dock Fee Collection by Week (${new Date().getFullYear()})`)}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs self-start sm:self-auto">
            <span className="text-slate-500 dark:text-sky-200/70">{l('Total Semanas:', 'Total Weeks:')}</span>
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
                  name === l('PAX Atendidos', 'PAX Served') ? `${value} ${l('personas', 'people')}` : formatCurrencyMXN(Number(value)),
                  name
                ]}
                contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="ingresosMXN" name={l('Ingresos Totales', 'Total Revenue')} fill={isDark ? '#38bdf8' : '#002147'} radius={[4, 4, 0, 0]} barSize={22} />
              <Bar yAxisId="left" dataKey="utilidadMXN" name={l('Utilidad Operativa', 'Operating Profit')} fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
              <Line yAxisId="right" type="monotone" dataKey="pax" name={l('PAX Atendidos', 'PAX Served')} stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} />
              <Line yAxisId="left" type="monotone" dataKey="muelleMXN" name={l('Ingreso Muellaje', 'Dock Fee Revenue')} stroke="#00A3E0" strokeWidth={2} strokeDasharray="4 4" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: PAX Demographics + Top Promoters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
        {/* PAX Mix Chart */}
        <div className="bg-white dark:bg-[#0b1728] rounded-xl p-4 sm:p-5 border border-sky-100 dark:border-[#162a4a] shadow-xs min-w-0">
          <div className="flex items-center justify-between mb-1 pb-2 border-b border-sky-50 dark:border-[#162a4a]/80">
            <div>
              <h3 className="text-sm font-bold text-[#002147] dark:text-[#7cd1ff] tracking-tight">
                {l('Composición de Pasajeros (PAX)', 'Passenger (PAX) Demographics')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-sky-200/60">
                {l('Segmentación por categoría para cálculo de aforo y muellaje', 'Category breakdown for capacity and dock fee calculation')}
              </p>
            </div>
            <span className="text-xs font-bold text-[#002147] dark:text-[#7cd1ff] bg-sky-50 dark:bg-[#0f233d] px-2 py-0.5 rounded border border-sky-200 dark:border-[#1e3e68]">
              {formatNumber(metrics.totalPax)} {l('Total', 'Total')}
            </span>
          </div>

          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paxPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {paxPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} ${l('pasajeros', 'passengers')}`, l('Cantidad', 'Quantity')]}
                  contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Promoters Ranking */}
        <div className="bg-white dark:bg-[#0b1728] rounded-xl p-4 sm:p-5 border border-sky-100 dark:border-[#162a4a] shadow-xs min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2 pb-2 border-b border-sky-50 dark:border-[#162a4a]/80">
            <div>
              <h3 className="text-sm font-bold text-[#002147] dark:text-[#7cd1ff] tracking-tight">
                {l('Top Promotores & Generadores de Venta', 'Top Sales Promoters & Earners')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-sky-200/60">
                {l('Listado completo de promotores — La comisión indicada es exclusivamente lo que reciben en la', 'Complete promoter list — The commission indicated is exclusively from the')}{' '}
                <strong className="text-[#002147] dark:text-sky-300">{l('Columna Comisión', 'Commission Column')}</strong>
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-sky-200/60 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-200/50 dark:border-sky-800/50 self-start sm:self-auto">
              {l('Total Promotores:', 'Total Promoters:')} {promotersData.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-96 overflow-y-auto pr-1">
            {promotersData.map((prom, index) => (
              <div key={prom.promotor} className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                    index === 0 ? 'bg-amber-400 text-slate-900 shadow-xs' :
                    index === 1 ? 'bg-slate-300 text-slate-900' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{prom.promotor}</p>
                    <p className="text-[10px] text-slate-500 dark:text-sky-200/60">
                      {prom.operaciones} {prom.operaciones === 1 ? l('Operación', 'Operation') : l('Operaciones', 'Operations')} {l('registradas', 'recorded')}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900 dark:text-sky-100 font-mono">{formatCurrencyMXN(prom.ventasMXN)}</p>
                  <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 font-mono">
                    {l('Comisión:', 'Commission:')} {formatCurrencyMXN(prom.comisionMXN)}
                  </p>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block">{l('Columna Comisión', 'Commission Column')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

