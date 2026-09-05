import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  fetchMarinaData, 
  calculateExecutiveMetrics, 
  getActivitiesSummary, 
  getLocationsSummary, 
  getPromotersSummary, 
  getWeeklyTrends 
} from './services/dataService';
import { OperationRecord, FilterState } from './types/marina';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { MetricCards } from './components/MetricCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { OperationsTable } from './components/OperationsTable';
import { OperationDetailModal } from './components/OperationDetailModal';
import { PaxMuelleCalculator } from './components/PaxMuelleCalculator';
import { ExecutiveSummaryView } from './components/ExecutiveSummaryView';
import { BusinessGuideModal } from './components/BusinessGuideModal';
import { SecurityCertificatesModal } from './components/SecurityCertificatesModal';
import { MobileNav } from './components/MobileNav';
import { MobileDrawer } from './components/MobileDrawer';
import { BackToTopButton } from './components/BackToTopButton';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { checkFetchRateLimit } from './utils/security';

function MarinaDashboardApp() {
  const [records, setRecords] = useState<OperationRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastFetched, setLastFetched] = useState<Date>(new Date());
  const [selectedRecord, setSelectedRecord] = useState<OperationRecord | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isCertificatesOpen, setIsCertificatesOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'operations' | 'executive' | 'calculator'>('dashboard');
  const [rateLimitNotice, setRateLimitNotice] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    semana: 'ALL',
    actividad: 'ALL',
    locacion: 'ALL',
    promotor: 'ALL',
    proveedor: 'ALL',
    estatusCobro: 'ALL',
    moneda: 'ALL',
    searchQuery: '',
    dateRange: 'ALL'
  });

  // Load Data with Rate Limiting Protection
  const loadData = useCallback(async (isManual = false) => {
    if (isManual) {
      const rateCheck = checkFetchRateLimit();
      if (!rateCheck.allowed) {
        setRateLimitNotice(rateCheck.reason || 'Límite de solicitudes alcanzado. Por favor espera.');
        setTimeout(() => setRateLimitNotice(null), 4000);
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await fetchMarinaData();
      setRecords(result.records);
      setIsLive(result.isLive);
      setLastFetched(result.lastFetched);
    } catch (err) {
      console.error('Error loading marina data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extract unique filter options from master records (ordered descending from highest to lowest week)
  const availableWeeks = useMemo(() => {
    const weeks = Array.from(new Set(records.map(r => r.semana).filter(Boolean))) as string[];
    return weeks.sort((a, b) => (parseInt(b, 10) || 0) - (parseInt(a, 10) || 0));
  }, [records]);

  const availableActivities = useMemo(() => {
    return (Array.from(new Set(records.map(r => r.actividad).filter(Boolean))) as string[]).sort();
  }, [records]);

  const availableLocations = useMemo(() => {
    return (Array.from(new Set(records.map(r => r.locacion).filter(Boolean))) as string[]).sort();
  }, [records]);

  const availablePromoters = useMemo(() => {
    return (Array.from(new Set(records.map(r => r.promotor).filter(Boolean))) as string[]).sort();
  }, [records]);

  const availableProviders = useMemo(() => {
    return (Array.from(new Set(records.map(r => r.proveedor).filter(Boolean))) as string[]).sort();
  }, [records]);

  // Apply filters to records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (filters.semana !== 'ALL' && record.semana !== filters.semana) return false;
      if (filters.actividad !== 'ALL' && record.actividad !== filters.actividad) return false;
      if (filters.locacion !== 'ALL' && record.locacion !== filters.locacion) return false;
      if (filters.promotor !== 'ALL' && record.promotor !== filters.promotor) return false;
      if (filters.proveedor !== 'ALL' && record.proveedor !== filters.proveedor) return false;
      if (filters.estatusCobro !== 'ALL' && record.estatusCobro !== filters.estatusCobro) return false;
      if (filters.moneda !== 'ALL' && record.moneda !== filters.moneda) return false;
      
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchFolio = record.cupon.toLowerCase().includes(query);
        const matchServ = record.servicio.toLowerCase().includes(query);
        const matchAct = record.actividad.toLowerCase().includes(query);
        const matchProm = record.promotor.toLowerCase().includes(query);
        const matchProv = record.proveedor.toLowerCase().includes(query);
        const matchNotas = record.notas.toLowerCase().includes(query);
        if (!matchFolio && !matchServ && !matchAct && !matchProm && !matchProv && !matchNotas) {
          return false;
        }
      }
      return true;
    });
  }, [records, filters]);

  // Executive Metrics computed for current filter scope
  const metrics = useMemo(() => {
    return calculateExecutiveMetrics(filteredRecords);
  }, [filteredRecords]);

  // Aggregated summaries for charts and executive views
  const activitiesSummary = useMemo(() => {
    return getActivitiesSummary(filteredRecords);
  }, [filteredRecords]);

  const locationsSummary = useMemo(() => {
    return getLocationsSummary(filteredRecords);
  }, [filteredRecords]);

  const promotersSummary = useMemo(() => {
    return getPromotersSummary(filteredRecords);
  }, [filteredRecords]);

  const weeklyTrends = useMemo(() => {
    return getWeeklyTrends(filters.semana === 'ALL' ? records : filteredRecords);
  }, [records, filteredRecords, filters.semana]);

  // Filter change handler
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = [
      'Folio/Cupon',
      'Semana',
      'Dia Reserva',
      'Dia Operacion',
      'Actividad',
      'Servicio',
      'PAX Codigo',
      'Total PAX',
      'Adultos',
      'Ninos',
      'Infantes',
      'Horas',
      'Locacion',
      'Promotor',
      'Proveedor',
      'Costo Reporte Neto',
      'Moneda',
      'Tipo Cambio',
      'Over',
      'Subtotal con Over',
      'Venta',
      'Comision Neta',
      'Comision Vendedor',
      'Utilidad Casa',
      'Deposito',
      'Balance',
      'Total',
      'Ingreso Muelle MXN',
      'Venta MXN',
      'Ingresos Totales MXN',
      'Utilidad Operativa MXN',
      'Margen Operativo %',
      'Estatus Cobro',
      'Notas'
    ];

    const rows = filteredRecords.map(r => [
      `"${r.cupon || ''}"`,
      `"${r.semana}"`,
      `"${r.diaReserva}"`,
      `"${r.diaOperacion}"`,
      `"${r.actividad}"`,
      `"${r.servicio}"`,
      `"${r.paxRaw}"`,
      r.pax.total,
      r.pax.adults,
      r.pax.children,
      r.pax.infants,
      r.horas,
      `"${r.locacion}"`,
      `"${r.promotor}"`,
      `"${r.proveedor}"`,
      r.costoReporteNeto,
      `"${r.moneda}"`,
      r.tipoCambio || '',
      r.over,
      r.subtotalConOver,
      r.venta,
      r.comisionNeta,
      r.comision,
      r.casa,
      r.deposito,
      r.balance,
      r.total,
      r.ingresoMuelleMXN,
      r.ventaMXN,
      r.ingresosTotalesMXN,
      r.utilidadOperativaMXN,
      r.margenOperativo.toFixed(1),
      `"${r.estatusCobro}"`,
      `"${(r.notas || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cancun_lighthouse_marina_report_${filters.semana === 'ALL' ? 'acumulado' : 'sem_' + filters.semana}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f0f6fc] dark:bg-[#030914] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#00A3E0] selection:text-white w-full max-w-full overflow-x-hidden pb-16 lg:pb-0 transition-colors duration-200">
      {/* Network Status Offline Banner */}
      <NetworkStatusBanner onReconnect={() => loadData(true)} />

      {/* Rate Limit Toast Banner */}
      {rateLimitNotice && (
        <div className="fixed top-16 right-4 z-50 bg-amber-900/95 text-amber-100 px-4 py-2.5 rounded-xl border border-amber-500/40 shadow-2xl text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{rateLimitNotice}</span>
        </div>
      )}

      {/* Sticky Top Header */}
      <Header
        filters={filters}
        onFilterChange={handleFilterChange}
        availableWeeks={availableWeeks}
        lastFetched={lastFetched}
        isLive={isLive}
        onRefresh={() => loadData(true)}
        isLoading={isLoading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenCertificates={() => setIsCertificatesOpen(true)}
        onExportCSV={handleExportCSV}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 min-w-0 overflow-x-hidden">
        {/* Active View: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200 min-w-0">
            {/* Hero Section with Live Financial Metrics & Tickers */}
            <HeroSection
              metrics={metrics}
              filters={filters}
              onFilterChange={handleFilterChange}
              availableWeeks={availableWeeks}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onOpenCertificates={() => setIsCertificatesOpen(true)}
              onExportCSV={handleExportCSV}
            />

            {/* Top Metric Cards */}
            <MetricCards 
              metrics={metrics} 
              selectedWeek={filters.semana} 
            />

            {/* Visual Analytics & Charts */}
            <AnalyticsCharts
              activitiesData={activitiesSummary}
              locationsData={locationsSummary}
              promotersData={promotersSummary}
              weeklyData={weeklyTrends}
              metrics={metrics}
            />

            {/* Quick Access Operations Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Registro de Operaciones Recientes
                </h3>
                <button
                  onClick={() => setActiveTab('operations')}
                  className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 underline cursor-pointer"
                >
                  Ver tabla completa con todos los filtros →
                </button>
              </div>

              <OperationsTable
                records={records}
                filters={filters}
                onFilterChange={handleFilterChange}
                onSelectRecord={setSelectedRecord}
                onExportCSV={handleExportCSV}
                availableWeeks={availableWeeks}
                availableActivities={availableActivities}
                availableLocations={availableLocations}
                availablePromoters={availablePromoters}
                availableProviders={availableProviders}
              />
            </div>
          </div>
        )}

        {/* Active View: Detailed Operations */}
        {activeTab === 'operations' && (
          <div className="space-y-6 animate-in fade-in duration-200 min-w-0">
            <MetricCards 
              metrics={metrics} 
              selectedWeek={filters.semana} 
            />

            <OperationsTable
              records={records}
              filters={filters}
              onFilterChange={handleFilterChange}
              onSelectRecord={setSelectedRecord}
              onExportCSV={handleExportCSV}
              availableWeeks={availableWeeks}
              availableActivities={availableActivities}
              availableLocations={availableLocations}
              availablePromoters={availablePromoters}
              availableProviders={availableProviders}
            />
          </div>
        )}

        {/* Active View: Executive Summary Sheet */}
        {activeTab === 'executive' && (
          <div className="animate-in fade-in duration-200 min-w-0">
            <ExecutiveSummaryView
              metrics={metrics}
              activitiesSummary={activitiesSummary}
              locationsSummary={locationsSummary}
              selectedWeek={filters.semana}
            />
          </div>
        )}

        {/* Active View: PAX & Muelle Calculator */}
        {activeTab === 'calculator' && (
          <div className="animate-in fade-in duration-200 min-w-0">
            <PaxMuelleCalculator />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="text-white font-bold">Cancun Lighthouse Marina</span> — Sistema Corporativo de Control Financiero y Operativo {new Date().getFullYear()}
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>Fuente: Google Sheets TSV</span>
            <span>•</span>
            <button 
              onClick={() => setIsGuideOpen(true)}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Guía de llenado
            </button>
            <span>•</span>
            <button 
              onClick={() => setIsCertificatesOpen(true)}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              Certificados
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('calculator')}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Simulador PAX & Muelle
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      <BackToTopButton />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenDrawer={() => setIsMobileDrawerOpen(true)}
      />

      {/* Mobile Slide-Over Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        availableWeeks={availableWeeks}
        onRefresh={() => loadData(true)}
        isLoading={isLoading}
        onExportCSV={handleExportCSV}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenCertificates={() => setIsCertificatesOpen(true)}
        isLive={isLive}
        lastFetched={lastFetched}
      />

      {/* Operation Detail Voucher Modal */}
      {selectedRecord && (
        <OperationDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {/* Business Guide Modal */}
      <BusinessGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Security & Official Certificates Modal */}
      <SecurityCertificatesModal
        isOpen={isCertificatesOpen}
        onClose={() => setIsCertificatesOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <MarinaDashboardApp />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
