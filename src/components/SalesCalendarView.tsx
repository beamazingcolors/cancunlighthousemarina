import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  Ship, 
  Users, 
  DollarSign, 
  Clock, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Filter, 
  ArrowRight,
  Flame,
  Zap,
  Target,
  Award,
  Layers,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OperationRecord } from '../types/marina';
import { formatCurrencyMXN, formatNumber, formatPercent } from '../utils/formatters';
import { 
  parseMexicanDate, 
  toISODateKey, 
  formatFullMexicanDate, 
  formatLocalizedDate,
  MONTH_NAMES_ES, 
  MONTH_NAMES_EN,
  WEEKDAY_NAMES_ES, 
  WEEKDAY_NAMES_EN,
  WEEKDAY_SHORT_ES, 
  WEEKDAY_SHORT_EN 
} from '../utils/dateUtils';
import { useLanguage } from '../context/LanguageContext';

interface SalesCalendarViewProps {
  records: OperationRecord[];
  onSelectDay?: (dateKey: string) => void;
  onSelectWeek?: (weekNumber: string) => void;
  onCloseModal?: () => void;
  isModal?: boolean;
  initialMode?: 'days' | 'weeks';
}

interface DayData {
  date: Date;
  dateKey: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  records: OperationRecord[];
  totalVentasMXN: number;
  totalUtilidadMXN: number;
  totalPax: number;
  opsCount: number;
  activities: Record<string, number>;
  topService: string;
}

interface WeekData {
  semana: string;
  totalVentasMXN: number;
  totalCostosMXN: number;
  totalComisionesMXN: number;
  totalUtilidadMXN: number;
  margenOperativo: number;
  opsCount: number;
  totalPax: number;
  dateRange: string;
  promotores: { name: string; count: number; ventasMXN: number }[];
  topActivities: { name: string; count: number; ventasMXN: number }[];
  topServices: { name: string; count: number; ventasMXN: number }[];
  dailyBreakdown: { dayName: string; shortDate: string; ventasMXN: number; ops: number }[];
  records: OperationRecord[];
}

export const SalesCalendarView: React.FC<SalesCalendarViewProps> = ({
  records,
  onSelectDay,
  onSelectWeek,
  onCloseModal,
  isModal = false,
  initialMode = 'days'
}) => {
  const { language, l, t } = useLanguage();
  const monthNames = language === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_ES;
  const weekdayNames = language === 'en' ? WEEKDAY_NAMES_EN : WEEKDAY_NAMES_ES;
  const weekdayShort = language === 'en' ? WEEKDAY_SHORT_EN : WEEKDAY_SHORT_ES;

  const [viewMode, setViewMode] = useState<'days' | 'weeks'>(initialMode);
  const [selectedWeekDetail, setSelectedWeekDetail] = useState<WeekData | null>(null);

  useEffect(() => {
    if (initialMode) {
      setViewMode(initialMode);
    }
  }, [initialMode]);

  // Map operations by ISO date key ("YYYY-MM-DD")
  const recordsByDate = useMemo(() => {
    const map = new Map<string, OperationRecord[]>();
    for (const r of records) {
      const d = parseMexicanDate(r.diaOperacion || r.diaReserva);
      if (d) {
        const key = toISODateKey(d);
        const list = map.get(key) || [];
        list.push(r);
        map.set(key, list);
      }
    }
    return map;
  }, [records]);

  // Determine available months in the data
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    recordsByDate.forEach((_, key) => {
      const [y, m] = key.split('-');
      monthSet.add(`${y}-${m}`);
    });
    return Array.from(monthSet).sort();
  }, [recordsByDate]);

  // Current viewed month: default to the month with the most operations
  const defaultYearMonth = useMemo(() => {
    if (availableMonths.length > 0) {
      let bestMonth = availableMonths[0];
      let maxCount = 0;
      availableMonths.forEach(ym => {
        let count = 0;
        recordsByDate.forEach((recs, key) => {
          if (key.startsWith(ym)) count += recs.length;
        });
        if (count > maxCount) {
          maxCount = count;
          bestMonth = ym;
        }
      });
      return bestMonth;
    }
    return '2026-08';
  }, [availableMonths, recordsByDate]);

  const [currentYearMonth, setCurrentYearMonth] = useState<string>(defaultYearMonth);
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);

  // Close popup or modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedDayData) {
          setSelectedDayData(null);
        } else if (onCloseModal) {
          onCloseModal();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDayData, onCloseModal]);

  const [viewYear, viewMonth] = useMemo(() => {
    const parts = currentYearMonth.split('-');
    return [parseInt(parts[0], 10), parseInt(parts[1], 10) - 1];
  }, [currentYearMonth]);

  // Month navigation
  const handlePrevMonth = () => {
    let newM = viewMonth - 1;
    let newY = viewYear;
    if (newM < 0) {
      newM = 11;
      newY -= 1;
    }
    setCurrentYearMonth(`${newY}-${String(newM + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newM = viewMonth + 1;
    let newY = viewYear;
    if (newM > 11) {
      newM = 0;
      newY += 1;
    }
    setCurrentYearMonth(`${newY}-${String(newM + 1).padStart(2, '0')}`);
  };

  // Build grid days for the viewed month
  const calendarDays = useMemo(() => {
    const days: DayData[] = [];
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    // Previous month padding days
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(viewYear, viewMonth - 1, dayNum);
      const key = toISODateKey(d);
      const dayRecs = recordsByDate.get(key) || [];
      days.push({
        date: d,
        dateKey: key,
        dayOfMonth: dayNum,
        isCurrentMonth: false,
        records: dayRecs,
        totalVentasMXN: dayRecs.reduce((acc, r) => acc + (r.ventaMXN || 0), 0),
        totalUtilidadMXN: dayRecs.reduce((acc, r) => acc + (r.utilidadOperativaMXN || 0), 0),
        totalPax: dayRecs.reduce((acc, r) => acc + (r.pax?.total || 0), 0),
        opsCount: dayRecs.length,
        activities: {},
        topService: ''
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= lastDayOfMonth.getDate(); dayNum++) {
      const d = new Date(viewYear, viewMonth, dayNum);
      const key = toISODateKey(d);
      const dayRecs = recordsByDate.get(key) || [];
      const activities: Record<string, number> = {};
      const serviceCounts: Record<string, number> = {};

      dayRecs.forEach(r => {
        activities[r.actividad] = (activities[r.actividad] || 0) + 1;
        if (r.servicio) {
          serviceCounts[r.servicio] = (serviceCounts[r.servicio] || 0) + 1;
        }
      });

      let topService = '';
      let topCount = 0;
      Object.entries(serviceCounts).forEach(([s, cnt]) => {
        if (cnt > topCount) {
          topCount = cnt;
          topService = s;
        }
      });

      days.push({
        date: d,
        dateKey: key,
        dayOfMonth: dayNum,
        isCurrentMonth: true,
        records: dayRecs,
        totalVentasMXN: dayRecs.reduce((acc, r) => acc + (r.ventaMXN || 0), 0),
        totalUtilidadMXN: dayRecs.reduce((acc, r) => acc + (r.utilidadOperativaMXN || 0), 0),
        totalPax: dayRecs.reduce((acc, r) => acc + (r.pax?.total || 0), 0),
        opsCount: dayRecs.length,
        activities,
        topService
      });
    }

    // Trailing days from next month
    const remaining = 42 - days.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const d = new Date(viewYear, viewMonth + 1, dayNum);
      const key = toISODateKey(d);
      const dayRecs = recordsByDate.get(key) || [];
      days.push({
        date: d,
        dateKey: key,
        dayOfMonth: dayNum,
        isCurrentMonth: false,
        records: dayRecs,
        totalVentasMXN: dayRecs.reduce((acc, r) => acc + (r.ventaMXN || 0), 0),
        totalUtilidadMXN: dayRecs.reduce((acc, r) => acc + (r.utilidadOperativaMXN || 0), 0),
        totalPax: dayRecs.reduce((acc, r) => acc + (r.pax?.total || 0), 0),
        opsCount: dayRecs.length,
        activities: {},
        topService: ''
      });
    }

    return days;
  }, [viewYear, viewMonth, recordsByDate]);

  // Viewed month totals
  const viewedMonthStats = useMemo(() => {
    let totalVentas = 0;
    let totalOps = 0;
    let totalPax = 0;
    let totalUtilidad = 0;

    calendarDays.forEach(d => {
      if (d.isCurrentMonth) {
        totalVentas += d.totalVentasMXN;
        totalOps += d.opsCount;
        totalPax += d.totalPax;
        totalUtilidad += d.totalUtilidadMXN;
      }
    });

    return { totalVentas, totalOps, totalPax, totalUtilidad };
  }, [calendarDays]);

  // =========================================================================
  // WEEKLY VIEW DATA: AGGREGATED EXCLUSIVELY BY WEEKS
  // =========================================================================
  const weeklyAggregatedData = useMemo(() => {
    const map = new Map<string, OperationRecord[]>();
    for (const r of records) {
      const sem = r.semana || 'Sin Semana';
      const list = map.get(sem) || [];
      list.push(r);
      map.set(sem, list);
    }

    const weeks: WeekData[] = [];
    map.forEach((weekRecs, sem) => {
      const totalVentas = weekRecs.reduce((acc, r) => acc + (r.ventaMXN || 0), 0);
      const totalCostos = weekRecs.reduce((acc, r) => acc + (r.costoTotalMXN || 0), 0);
      const totalComisiones = weekRecs.reduce((acc, r) => acc + (r.comisionMXN || 0), 0);
      const totalUtilidad = weekRecs.reduce((acc, r) => acc + (r.utilidadOperativaMXN || 0), 0);
      const totalPax = weekRecs.reduce((acc, r) => acc + (r.pax?.total || 0), 0);
      const margen = totalVentas > 0 ? (totalUtilidad / totalVentas) * 100 : 0;

      // Extract date range
      const dates = weekRecs
        .map(r => parseMexicanDate(r.diaOperacion || r.diaReserva))
        .filter((d): d is Date => d !== null)
        .sort((a, b) => a.getTime() - b.getTime());

      let dateRange = 'Fechas varias';
      if (dates.length > 0) {
        const dMin = dates[0];
        const dMax = dates[dates.length - 1];
        const formatShort = (d: Date) => `${d.getDate()} ${MONTH_NAMES_ES[d.getMonth()]?.slice(0, 3)}`;
        dateRange = dMin.getTime() === dMax.getTime()
          ? formatShort(dMin)
          : `${formatShort(dMin)} - ${formatShort(dMax)} ${dMax.getFullYear()}`;
      }

      // Promoters summary in this week
      const promoterMap: Record<string, { count: number; ventasMXN: number }> = {};
      weekRecs.forEach(r => {
        const promName = r.promotor?.trim() || 'Sin Promotor';
        if (!promoterMap[promName]) {
          promoterMap[promName] = { count: 0, ventasMXN: 0 };
        }
        promoterMap[promName].count++;
        promoterMap[promName].ventasMXN += (r.ventaMXN || 0);
      });
      const promotores = Object.entries(promoterMap)
        .map(([name, data]) => ({ name, count: data.count, ventasMXN: data.ventasMXN }))
        .sort((a, b) => b.ventasMXN - a.ventasMXN);

      // Activities breakdown
      const actMap: Record<string, { count: number; ventasMXN: number }> = {};
      weekRecs.forEach(r => {
        const act = r.actividad || 'General';
        if (!actMap[act]) actMap[act] = { count: 0, ventasMXN: 0 };
        actMap[act].count++;
        actMap[act].ventasMXN += (r.ventaMXN || 0);
      });
      const topActivities = Object.entries(actMap)
        .map(([name, data]) => ({ name, count: data.count, ventasMXN: data.ventasMXN }))
        .sort((a, b) => b.count - a.count);

      // Services breakdown
      const servMap: Record<string, { count: number; ventasMXN: number }> = {};
      weekRecs.forEach(r => {
        if (r.servicio) {
          if (!servMap[r.servicio]) servMap[r.servicio] = { count: 0, ventasMXN: 0 };
          servMap[r.servicio].count++;
          servMap[r.servicio].ventasMXN += (r.ventaMXN || 0);
        }
      });
      const topServices = Object.entries(servMap)
        .map(([name, data]) => ({ name, count: data.count, ventasMXN: data.ventasMXN }))
        .sort((a, b) => b.ventasMXN - a.ventasMXN)
        .slice(0, 3);

      // Daily breakdown
      const dayMap: Record<string, { shortDate: string; ventasMXN: number; ops: number }> = {};
      weekRecs.forEach(r => {
        const d = parseMexicanDate(r.diaOperacion || r.diaReserva);
        const dayLabel = d ? WEEKDAY_SHORT_ES[d.getDay()] : 'Dia';
        const shortDate = d ? `${d.getDate()}/${d.getMonth() + 1}` : '';
        const key = `${dayLabel} ${shortDate}`;
        if (!dayMap[key]) dayMap[key] = { shortDate, ventasMXN: 0, ops: 0 };
        dayMap[key].ventasMXN += (r.ventaMXN || 0);
        dayMap[key].ops++;
      });
      const dailyBreakdown = Object.entries(dayMap).map(([dayName, data]) => ({
        dayName,
        shortDate: data.shortDate,
        ventasMXN: data.ventasMXN,
        ops: data.ops
      }));

      weeks.push({
        semana: sem,
        totalVentasMXN: totalVentas,
        totalCostosMXN: totalCostos,
        totalComisionesMXN: totalComisiones,
        totalUtilidadMXN: totalUtilidad,
        margenOperativo: margen,
        opsCount: weekRecs.length,
        totalPax: totalPax,
        dateRange,
        promotores,
        topActivities,
        topServices,
        dailyBreakdown,
        records: weekRecs
      });
    });

    // Sort weeks descending (e.g. Sem 39, 38, ... 30)
    weeks.sort((a, b) => (parseInt(b.semana, 10) || 0) - (parseInt(a.semana, 10) || 0));

    // Calculate totals across weeks
    const facturacionTotal = weeks.reduce((acc, w) => acc + w.totalVentasMXN, 0);
    const utilidadTotal = weeks.reduce((acc, w) => acc + w.totalUtilidadMXN, 0);
    const opsTotal = weeks.reduce((acc, w) => acc + w.opsCount, 0);
    const promedioVentas = weeks.length > 0 ? facturacionTotal / weeks.length : 0;

    let bestWeek = weeks[0];
    let worstWeek = weeks[0];
    let maxWeekSales = 1;

    weeks.forEach(w => {
      if (w.totalVentasMXN > (bestWeek?.totalVentasMXN || 0)) bestWeek = w;
      if (w.totalVentasMXN < (worstWeek?.totalVentasMXN || Infinity)) worstWeek = w;
      if (w.totalVentasMXN > maxWeekSales) maxWeekSales = w.totalVentasMXN;
    });

    return {
      weeks,
      facturacionTotal,
      utilidadTotal,
      opsTotal,
      promedioVentas,
      bestWeek,
      worstWeek,
      maxWeekSales
    };
  }, [records]);

  // =========================================================================
  // STATISTICAL ANALYSIS: DAY OF WEEK PERFORMANCE & SMART SALES ADVICE
  // =========================================================================
  const dayOfWeekAnalytics = useMemo(() => {
    const dayStats = Array.from({ length: 7 }, (_, i) => ({
      dayIndex: i,
      dayName: WEEKDAY_NAMES_ES[i],
      shortName: WEEKDAY_SHORT_ES[i],
      totalVentasMXN: 0,
      totalOps: 0,
      totalPax: 0,
      totalUtilidadMXN: 0,
      activities: {} as Record<string, number>,
      services: {} as Record<string, { count: number; ventasMXN: number }>,
      topActivity: '',
      topService: ''
    }));

    for (const r of records) {
      const d = parseMexicanDate(r.diaOperacion || r.diaReserva);
      if (d) {
        const dow = d.getDay();
        const stat = dayStats[dow];
        stat.totalOps++;
        stat.totalVentasMXN += (r.ventaMXN || 0);
        stat.totalUtilidadMXN += (r.utilidadOperativaMXN || 0);
        stat.totalPax += (r.pax?.total || 0);

        stat.activities[r.actividad] = (stat.activities[r.actividad] || 0) + 1;

        if (r.servicio) {
          if (!stat.services[r.servicio]) {
            stat.services[r.servicio] = { count: 0, ventasMXN: 0 };
          }
          stat.services[r.servicio].count++;
          stat.services[r.servicio].ventasMXN += (r.ventaMXN || 0);
        }
      }
    }

    dayStats.forEach(stat => {
      let maxActCount = 0;
      Object.entries(stat.activities).forEach(([act, cnt]) => {
        if (cnt > maxActCount) {
          maxActCount = cnt;
          stat.topActivity = act;
        }
      });

      let maxServVenta = 0;
      Object.entries(stat.services).forEach(([serv, data]) => {
        if (data.ventasMXN > maxServVenta) {
          maxServVenta = data.ventasMXN;
          stat.topService = serv;
        }
      });
    });

    let bestRevenueDay = dayStats[0];
    let bestOpsDay = dayStats[0];
    let worstRevenueDay = dayStats[0];

    dayStats.forEach(stat => {
      if (stat.totalVentasMXN > bestRevenueDay.totalVentasMXN) bestRevenueDay = stat;
      if (stat.totalOps > bestOpsDay.totalOps) bestOpsDay = stat;
      if (stat.totalOps > 0 && stat.totalVentasMXN < worstRevenueDay.totalVentasMXN) worstRevenueDay = stat;
    });

    const maxDaySales = Math.max(...dayStats.map(s => s.totalVentasMXN), 1);

    return {
      dayStats,
      bestRevenueDay,
      bestOpsDay,
      worstRevenueDay,
      maxDaySales
    };
  }, [records]);

  return (
    <div className={`space-y-6 ${isModal ? 'p-4 sm:p-6 max-h-[90vh] overflow-y-auto' : ''}`}>
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#002147] to-indigo-950 text-white rounded-2xl p-5 sm:p-7 border border-slate-700/80 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00A3E0]/20 text-[#00A3E0] text-xs font-semibold tracking-wide uppercase border border-[#00A3E0]/30 mb-2">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendario de Ventas & Control de Operación</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>{viewMode === 'days' ? 'Calendario Interactivo de Ventas' : 'Ventas Agrupadas Solo por Semanas'}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {records.length} Operaciones
              </span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {viewMode === 'days'
                ? 'Explora las ventas y zarpes día por día. Haz clic en cualquier día con actividad para ver el resumen del día.'
                : 'Resumen consolidado de ventas, márgenes e ingresos organizado exclusivamente por semana de operación.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* View Switcher: Ver Días vs Ver solo por Semanas */}
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/15 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('days')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'days'
                    ? 'bg-[#00A3E0] text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Ver calendario interactivo día a día"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Ver Días</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('weeks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'weeks'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Ver ventas consolidadas exclusivamente por semanas"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ver solo por Semanas</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
                  {weeklyAggregatedData.weeks.length}
                </span>
              </button>
            </div>

            {onCloseModal && (
              <button
                onClick={onCloseModal}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Month Selector bar (Only in 'days' view) */}
        {viewMode === 'days' && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Month Navigator */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-base sm:text-lg font-bold text-white min-w-[170px] text-center font-mono">
                {MONTH_NAMES_ES[viewMonth]} {viewYear}
              </span>

              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Quick Month Jump Chips */}
              <div className="hidden sm:flex items-center gap-1.5 ml-3">
                {availableMonths.map(ym => {
                  const [y, m] = ym.split('-');
                  const mName = MONTH_NAMES_ES[parseInt(m, 10) - 1]?.slice(0, 3);
                  const isSelected = ym === currentYearMonth;
                  return (
                    <button
                      key={`quick-month-${ym}`}
                      onClick={() => setCurrentYearMonth(ym)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#00A3E0] text-white shadow-xs'
                          : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
                      }`}
                    >
                      {mName} {y}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats for this month */}
            <div className="flex items-center gap-4 text-xs">
              <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ventas del Mes</span>
                <strong className="text-emerald-300 font-mono text-sm">{formatCurrencyMXN(viewedMonthStats.totalVentas)}</strong>
              </div>
              <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Operaciones</span>
                <strong className="text-sky-300 font-mono text-sm">{viewedMonthStats.totalOps} ops</strong>
              </div>
              <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pasajeros</span>
                <strong className="text-amber-300 font-mono text-sm">{viewedMonthStats.totalPax} PAX</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: DAILY CALENDAR GRID (VIEW MODE === 'days') */}
      {/* ========================================================================= */}
      {viewMode === 'days' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-200">
          {/* Days of week header (starts on Monday) */}
          <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider text-center py-2.5">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div className="text-indigo-600 dark:text-indigo-400">Sáb</div>
            <div className="text-rose-600 dark:text-rose-400">Dom</div>
          </div>

          {/* 7 columns grid for days */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
            {calendarDays.map((dayData, idx) => {
              const hasOps = dayData.opsCount > 0;
              const isSelected = selectedDayData?.dateKey === dayData.dateKey;
              
              let cellBg = 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60';
              if (!dayData.isCurrentMonth) {
                cellBg = 'bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600 opacity-60';
              } else if (hasOps) {
                if (dayData.totalVentasMXN >= 50000) {
                  cellBg = 'bg-emerald-50/70 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40';
                } else if (dayData.totalVentasMXN >= 20000) {
                  cellBg = 'bg-sky-50/70 dark:bg-sky-950/20 hover:bg-sky-100/60 dark:hover:bg-sky-950/40';
                } else {
                  cellBg = 'bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70';
                }
              }

              return (
                <div
                  key={`calendar-cell-${dayData.dateKey}-${idx}`}
                  onClick={() => {
                    if (hasOps) {
                      setSelectedDayData(dayData);
                    }
                  }}
                  className={`min-h-[90px] sm:min-h-[110px] p-2 sm:p-2.5 transition-all flex flex-col justify-between ${cellBg} ${
                    hasOps ? 'cursor-pointer' : 'cursor-default'
                  } ${isSelected ? 'ring-2 ring-[#00A3E0] z-10' : ''}`}
                >
                  {/* Day Header: Number + Ops badge */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      !dayData.isCurrentMonth
                        ? 'text-slate-400 dark:text-slate-600'
                        : hasOps
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {dayData.dayOfMonth}
                    </span>

                    {hasOps && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#00A3E0] text-white">
                        {dayData.opsCount} ops
                      </span>
                    )}
                  </div>

                  {/* Day Body: Total Sales and Activity Pills */}
                  {hasOps ? (
                    <div className="my-1 space-y-1">
                      <div className="text-xs sm:text-sm font-black font-mono text-emerald-700 dark:text-emerald-400 leading-tight">
                        {formatCurrencyMXN(dayData.totalVentasMXN)}
                      </div>

                      {dayData.topService && (
                        <div className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold truncate flex items-center gap-1">
                          <Ship className="w-2.5 h-2.5 text-[#00A3E0] shrink-0" />
                          <span className="truncate">{dayData.topService}</span>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-0.5">
                        <span>{dayData.totalPax} PAX</span>
                        <span className="text-[9px] text-[#007ba8] dark:text-[#38bdf8] font-bold flex items-center">
                          Ver día →
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 dark:text-slate-600 italic">
                      Sin salidas
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: WEEKLY VIEW (VIEW MODE === 'weeks') */}
      {/* ========================================================================= */}
      {viewMode === 'weeks' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Weekly KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Semanas Registradas
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono block">
                {weeklyAggregatedData.weeks.length} Semanas
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {weeklyAggregatedData.opsTotal} operaciones en total
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Facturación Semanal Total
              </span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono block">
                {formatCurrencyMXN(weeklyAggregatedData.facturacionTotal)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Ventas del módulo Plaza La Isla
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Promedio por Semana
              </span>
              <span className="text-xl font-black text-[#00A3E0] font-mono block">
                {formatCurrencyMXN(weeklyAggregatedData.promedioVentas)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Media histórica de facturación
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Semana con Mayor Venta
              </span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono block">
                Sem {weeklyAggregatedData.bestWeek?.semana || '36'}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block font-mono">
                {formatCurrencyMXN(weeklyAggregatedData.bestWeek?.totalVentasMXN || 0)}
              </span>
            </div>
          </div>

          {/* Weekly Performance Bar Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00A3E0]" />
                  <span>Comparativa Semanal de Ventas (Plaza La Isla Cancún)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Volumen de ventas en MXN y porcentaje de utilidad operativa semana por semana
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {weeklyAggregatedData.weeks.length} Semanas
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {weeklyAggregatedData.weeks.map(w => {
                const pct = Math.round((w.totalVentasMXN / weeklyAggregatedData.maxWeekSales) * 100);
                const isBest = w.semana === weeklyAggregatedData.bestWeek?.semana;

                return (
                  <div key={`week-bar-${w.semana}`} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white w-20">
                          Semana {w.semana}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
                          ({w.dateRange})
                        </span>
                        {isBest && (
                          <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                            Semana Récord
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-mono text-[11px]">
                          {w.opsCount} ops • {w.totalPax} PAX • Margen: {w.margenOperativo.toFixed(1)}%
                        </span>
                        <strong className="font-mono text-slate-900 dark:text-white min-w-[95px] text-right">
                          {formatCurrencyMXN(w.totalVentasMXN)}
                        </strong>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isBest 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                            : 'bg-gradient-to-r from-indigo-500 to-sky-400'
                        }`}
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cards for each Week */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>Desglose Detallado por Semana de Venta</span>
              <span className="text-xs text-slate-500 font-normal">
                Haz clic en una semana para ver o filtrar
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weeklyAggregatedData.weeks.map(w => {
                const isSelected = selectedWeekDetail?.semana === w.semana;

                return (
                  <div
                    key={`week-card-${w.semana}`}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-5 shadow-xs space-y-3.5 ${
                      isSelected
                        ? 'border-[#00A3E0] ring-2 ring-[#00A3E0]/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                          S{w.semana}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 dark:text-white text-base">
                              Semana {w.semana}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {w.opsCount} salidas
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 font-mono">
                            {w.dateRange}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Ventas Totales</span>
                        <span className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
                          {formatCurrencyMXN(w.totalVentasMXN)}
                        </span>
                      </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Utilidad Neta</span>
                        <strong className="text-[#002147] dark:text-[#38bdf8] font-mono">
                          {formatCurrencyMXN(w.totalUtilidadMXN)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Margen</span>
                        <strong className="text-cyan-700 dark:text-cyan-400 font-mono">
                          {w.margenOperativo.toFixed(1)}%
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Pasajeros</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-mono">
                          {w.totalPax} PAX
                        </strong>
                      </div>
                    </div>

                    {/* Top Services in this Week */}
                    {w.topServices.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Servicios Más Vendidos:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {w.topServices.map(s => (
                            <span
                              key={`ts-${w.semana}-${s.name}`}
                              className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                            >
                              <Ship className="w-3 h-3 text-[#00A3E0]" />
                              <span>{s.name} ({s.count}x)</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Promoters Active in this Week (Plaza La Isla) */}
                    {w.promotores.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center justify-between">
                          <span>Vendedores Plaza La Isla:</span>
                          <span className="text-[10px] font-normal text-slate-400">Venta cerrada</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {w.promotores.slice(0, 4).map(p => (
                            <span
                              key={`p-${w.semana}-${p.name}`}
                              className="text-[11px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-md font-semibold border border-indigo-200 dark:border-indigo-800/60"
                            >
                              {p.name}: {formatCurrencyMXN(p.ventasMXN)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedWeekDetail(isSelected ? null : w)}
                        className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{isSelected ? 'Ocultar bitácora' : `Ver ${w.opsCount} operaciones`}</span>
                      </button>

                      {onSelectWeek && (
                        <button
                          type="button"
                          onClick={() => onSelectWeek(w.semana)}
                          className="px-3 py-1.5 rounded-xl bg-[#00A3E0] hover:bg-[#008ec4] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Filter className="w-3.5 h-3.5" />
                          <span>Filtrar Dashboard por Semana {w.semana}</span>
                        </button>
                      )}
                    </div>

                    {/* Expandable Operations List for this Week */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2 space-y-2 overflow-hidden"
                      >
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 max-h-56">
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0">
                              <tr>
                                <th className="py-1.5 px-2.5">Servicio</th>
                                <th className="py-1.5 px-2.5">Fecha</th>
                                <th className="py-1.5 px-2.5 text-center">PAX</th>
                                <th className="py-1.5 px-2.5">Vendedor</th>
                                <th className="py-1.5 px-2.5 text-right">Venta MXN</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {w.records.map((r, ri) => (
                                <tr key={`w-rec-${r.id}-${ri}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                  <td className="py-1.5 px-2.5 font-bold text-slate-900 dark:text-white">
                                    {r.servicio || r.actividad}
                                  </td>
                                  <td className="py-1.5 px-2.5 text-slate-500 font-mono">
                                    {r.diaOperacion || r.diaReserva}
                                  </td>
                                  <td className="py-1.5 px-2.5 text-center font-mono">
                                    {r.pax.total}
                                  </td>
                                  <td className="py-1.5 px-2.5 text-slate-600 dark:text-slate-400">
                                    {r.promotor || 'Plaza La Isla'}
                                  </td>
                                  <td className="py-1.5 px-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                    {formatCurrencyMXN(r.ventaMXN)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DAY SUMMARY POPUP / MODAL (WHEN A DAY IS CLICKED IN CALENDAR VIEW) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedDayData && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 cursor-pointer"
            onClick={() => setSelectedDayData(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-[#002147] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#001733]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#00A3E0]">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Resumen del Día: {formatFullMexicanDate(selectedDayData.date)}
                    </h3>
                    <p className="text-xs text-sky-200">
                      {selectedDayData.opsCount} operaciones registradas • {selectedDayData.totalPax} Pasajeros Totales • Plaza La Isla Cancún
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDayData(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Day KPIs Bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Ventas del Día</span>
                  <span className="text-base font-black font-mono text-emerald-700 dark:text-emerald-400">
                    {formatCurrencyMXN(selectedDayData.totalVentasMXN)}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Utilidad Operativa</span>
                  <span className="text-base font-black font-mono text-[#002147] dark:text-[#38bdf8]">
                    {formatCurrencyMXN(selectedDayData.totalUtilidadMXN)}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Pasajeros (PAX)</span>
                  <span className="text-base font-black text-slate-800 dark:text-slate-100">
                    {selectedDayData.totalPax} PAX
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Operaciones</span>
                  <span className="text-base font-black text-[#00A3E0]">
                    {selectedDayData.opsCount} salidas
                  </span>
                </div>
              </div>

              {/* Operations Table */}
              <div className="p-4 overflow-y-auto flex-1">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                  Bitácora de Salidas y Reservas de este Día
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Servicio / Embarcación</th>
                        <th className="py-2.5 px-3">Actividad</th>
                        <th className="py-2.5 px-3 text-center">PAX</th>
                        <th className="py-2.5 px-3">Vendedor (Plaza La Isla)</th>
                        <th className="py-2.5 px-3 text-right">Venta MXN</th>
                        <th className="py-2.5 px-3 text-right">Utilidad MXN</th>
                        <th className="py-2.5 px-3 text-center">Estatus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {selectedDayData.records.map((r, i) => (
                        <tr key={`day-rec-${r.id}-${i}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                            {r.servicio}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {r.actividad}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-mono">
                            {r.pax.total}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                            {r.promotor || 'Plaza La Isla'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrencyMXN(r.ventaMXN)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {formatCurrencyMXN(r.utilidadOperativaMXN)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.estatusCobro === 'Liquidado'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}>
                              {r.estatusCobro}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {selectedDayData.records.length} registros en esta fecha
                </span>
                <div className="flex items-center gap-2">
                  {onSelectDay && (
                    <button
                      onClick={() => {
                        onSelectDay(selectedDayData.dateKey);
                        setSelectedDayData(null);
                        if (onCloseModal) onCloseModal();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#00A3E0] hover:bg-[#008ec4] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>Filtrar Dashboard por este Día</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedDayData(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* SECTION BELOW CALENDAR: DAY-OF-WEEK PERFORMANCE & COMMERCIAL TEAM ADVICE */}
      {/* ========================================================================= */}
      <div className="space-y-6 pt-2">
        {/* Header of Analytics Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#002147] dark:text-[#66d2ff] tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Estadística de Días de Venta & Consejos Comerciales</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Análisis comparativo de qué días se vende más, qué días se vende menos y recomendaciones clave para el equipo de ventas en <strong>Plaza La Isla Cancún, Quintana Roo</strong>
            </p>
          </div>
        </div>

        {/* Highlights: Best Day vs Worst Day Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Día que Más se Vende */}
          <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900 rounded-2xl p-5 border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-600" />
                Día con Mayor Facturación
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                Pico de Ventas
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {dayOfWeekAnalytics.bestRevenueDay.dayName}
            </div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
              {formatCurrencyMXN(dayOfWeekAnalytics.bestRevenueDay.totalVentasMXN)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Registra <strong>{dayOfWeekAnalytics.bestRevenueDay.totalOps} operaciones</strong> con <strong>{dayOfWeekAnalytics.bestRevenueDay.totalPax} PAX</strong>. 
              Servicio estrella más solicitado: <strong className="text-emerald-800 dark:text-emerald-300">{dayOfWeekAnalytics.bestRevenueDay.topService || dayOfWeekAnalytics.bestRevenueDay.topActivity}</strong>.
            </p>
          </div>

          {/* Card 2: Día con Mayor Número de Operaciones (Afluencia) */}
          <div className="bg-gradient-to-br from-sky-50 to-white dark:from-sky-950/30 dark:to-slate-900 rounded-2xl p-5 border-2 border-[#00A3E0]/30 dark:border-[#00A3E0]/40 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-300 dark:border-sky-800 flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#00A3E0]" />
                Mayor Volumen de Salidas
              </span>
              <span className="text-xs font-bold text-[#00A3E0]">
                Alta Ocupación
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {dayOfWeekAnalytics.bestOpsDay.dayName}
            </div>
            <div className="text-xl font-black text-[#00A3E0] font-mono mt-0.5">
              {dayOfWeekAnalytics.bestOpsDay.totalOps} Salidas Náuticas
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Ventas por <strong>{formatCurrencyMXN(dayOfWeekAnalytics.bestOpsDay.totalVentasMXN)}</strong>. 
              Día de mayor saturación de muelles y zarpes de flota.
            </p>
          </div>

          {/* Card 3: Día con Menos Ventas (Día Valle) */}
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-slate-500" />
                Día de Menor Venta (Valle)
              </span>
              <span className="text-xs font-bold text-slate-500">
                Oportunidad Comercial
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {dayOfWeekAnalytics.worstRevenueDay.dayName}
            </div>
            <div className="text-xl font-black text-slate-700 dark:text-slate-300 font-mono mt-0.5">
              {formatCurrencyMXN(dayOfWeekAnalytics.worstRevenueDay.totalVentasMXN)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Solo <strong>{dayOfWeekAnalytics.worstRevenueDay.totalOps} salidas</strong>. Requiere incentivos comerciales para elevar ocupación de embarcaciones.
            </p>
          </div>
        </div>

        {/* Day of Week Visual Comparison Bars */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Distribución de Ventas por Día de la Semana (Lunes a Domingo)</span>
            <span className="text-xs font-normal text-slate-500">Total ingresos en pesos</span>
          </h4>

          <div className="space-y-3.5">
            {dayOfWeekAnalytics.dayStats.map(stat => {
              const percentage = Math.round((stat.totalVentasMXN / dayOfWeekAnalytics.maxDaySales) * 100);
              const isBest = stat.dayIndex === dayOfWeekAnalytics.bestRevenueDay.dayIndex;
              const isBestOps = stat.dayIndex === dayOfWeekAnalytics.bestOpsDay.dayIndex;
              const isWorst = stat.dayIndex === dayOfWeekAnalytics.worstRevenueDay.dayIndex;

              return (
                <div key={`dow-row-${stat.dayIndex}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white w-20">
                        {stat.dayName}
                      </span>
                      {isBest && (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.2 rounded font-bold">
                          Mayor Venta
                        </span>
                      )}
                      {isBestOps && !isBest && (
                        <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-2 py-0.2 rounded font-bold">
                          Más Salidas
                        </span>
                      )}
                      {isWorst && (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.2 rounded font-bold">
                          Menor Venta
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {stat.totalOps} ops • {stat.totalPax} PAX
                      </span>
                      <strong className="font-mono text-slate-900 dark:text-white min-w-[90px] text-right">
                        {formatCurrencyMXN(stat.totalVentasMXN)}
                      </strong>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBest
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : isBestOps
                            ? 'bg-gradient-to-r from-[#00A3E0] to-sky-400'
                            : isWorst
                              ? 'bg-slate-400 dark:bg-slate-600'
                              : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commercial Sales Advice specifically for Plaza La Isla Cancún team */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-[#002147] text-white rounded-2xl p-6 sm:p-7 border border-indigo-500/30 shadow-md">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Consejos Comerciales para el Equipo de Ventas en Plaza La Isla Cancún, Quintana Roo
              </h4>
              <p className="text-xs text-indigo-200">
                Estrategias de captación en pasillos, módulos turísticos y embarques de la Laguna Nichupté hacia Isla Mujeres
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {/* Advice 1: Sábados y Fines de Semana */}
            <div className="bg-white/10 rounded-xl p-4 border border-white/15 backdrop-blur-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wide">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Sábados: Pico de Yates y Tours</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Al mercado turístico de Plaza La Isla le gusta más este día la renta de <strong className="text-white">Yates privados y Tours a Isla Mujeres (33 salidas registradas)</strong>.
              </p>
              <div className="p-2.5 rounded-lg bg-black/40 text-[11px] text-amber-200/90 border border-amber-400/20">
                <strong>Consejo para el Equipo:</strong> El flujo en Plaza La Isla se dispara desde mediodía. No otorgar descuentos ni condonar over en sábado; fijar tarifas premium, cobrar depósito inmediato y ofrecer upsells de catering, bebidas y horas extra al atardecer en la Laguna Nichupté.
              </div>
            </div>

            {/* Advice 2: Jueves de Alto Ticket */}
            <div className="bg-white/10 rounded-xl p-4 border border-white/15 backdrop-blur-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Jueves: Mayor Facturación</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Jueves genera la recaudación promedio más alta (<strong className="text-white">{formatCurrencyMXN(dayOfWeekAnalytics.bestRevenueDay.totalVentasMXN)}</strong>) con yates de lujo como Mercedes y Lorenzo.
              </p>
              <div className="p-2.5 rounded-lg bg-black/40 text-[11px] text-emerald-200/90 border border-emerald-400/20">
                <strong>Consejo para el Equipo:</strong> Enfocar a los vendedores en turistas internacionales y clientes ejecutivos que visitan los restaurantes de Plaza La Isla y buscan una experiencia privada antes de la congestión del fin de semana.
              </div>
            </div>

            {/* Advice 3: Martes - Días Valle & Plan de Choque */}
            <div className="bg-white/10 rounded-xl p-4 border border-white/15 backdrop-blur-xs space-y-2">
              <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wide">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span>Martes: Plan de Choque Comercial</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Es el día con menor facturación (<strong className="text-white">{formatCurrencyMXN(dayOfWeekAnalytics.worstRevenueDay.totalVentasMXN)}</strong>, solo 8 operaciones).
              </p>
              <div className="p-2.5 rounded-lg bg-black/40 text-[11px] text-sky-200/90 border border-sky-400/20">
                <strong>Consejo para el Equipo:</strong> El tráfico peatonal matutino en Plaza La Isla es más calmado. Ofrecer promociones 2x1 en Jungle Tour / snorkel en lancha rápida, paquetes familiares accesibles y reservar cupos anticipados para el fin de semana.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
