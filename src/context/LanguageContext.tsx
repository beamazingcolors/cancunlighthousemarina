import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en';

export interface Translations {
  // Common
  allWeeks: string;
  week: string;
  loading: string;
  refresh: string;
  export: string;
  close: string;
  save: string;
  status: string;
  search: string;
  actions: string;
  total: string;
  operations: string;
  pax: string;
  date: string;
  moneda: string;
  amount: string;
  notes: string;
  vendor: string;
  promoter: string;
  location: string;
  hours: string;
  folio: string;
  liquidated: string;
  pending: string;
  collected: string;

  // Header & Navigation
  brandMarina: string;
  sheetsConnected: string;
  localData: string;
  guideAndFormulas: string;
  sheetAudit: string;
  exportCsv: string;
  tabDashboard: string;
  tabOperations: string;
  tabExecutive: string;
  tabCalendar: string;
  filterByWeek: string;
  selectWeekPlaceholder: string;
  langEs: string;
  langEn: string;
  switchLangTitle: string;

  // Hero & Overview
  heroTitle: string;
  heroSubtitle: string;
  quickStatRevenue: string;
  quickStatProfit: string;
  quickStatOps: string;
  quickStatPax: string;

  // KPI Metric Cards
  cardRevenueTitle: string;
  cardRevenueSub: string;
  cardCostsTitle: string;
  cardCostsSub: string;
  cardProfitTitle: string;
  cardProfitSub: string;
  cardCommissionsTitle: string;
  cardCommissionsSub: string;
  cardDockTitle: string;
  cardDockSub: string;
  cardCollectionsTitle: string;
  cardCollectionsSub: string;
  currencyModeAllMxn: string;
  currencyModeSplit: string;
  currencyModeUsdEquiv: string;

  // Operations Table
  opsTableTitle: string;
  opsTableSubtitle: string;
  viewOperative: string;
  viewFinancial: string;
  viewAudit: string;
  colFolio: string;
  colActivity: string;
  colService: string;
  colPax: string;
  colDate: string;
  colOperationDate: string;
  colVendor: string;
  colPromoter: string;
  colLocation: string;
  colSale: string;
  colCost: string;
  colOver: string;
  colCommission: string;
  colHouse: string;
  colMargin: string;
  colDeposit: string;
  colBalance: string;
  colDockFee: string;
  colHours: string;
  colNotes: string;
  colPaymentStatus: string;
  colWeek: string;
  searchPlaceholder: string;
  noRecordsFound: string;
  showingRecords: string;
  of: string;
  page: string;
  previous: string;
  next: string;

  // Executive Summary View
  execTitle: string;
  execSubtitle: string;
  downloadPdfButton: string;
  downloadingPdf: string;
  execKpiRevenue: string;
  execKpiProfit: string;
  execKpiMargin: string;
  execKpiOperations: string;
  execKpiPax: string;
  execKpiCommissions: string;
  waterfallTitle: string;
  waterfallSubtitle: string;
  conceptCol: string;
  formulaCol: string;
  amountCol: string;
  pctRevenueCol: string;
  topActivitiesTitle: string;
  topActivitiesSubtitle: string;
  colActivityTrips: string;
  colActivityRevenue: string;
  colActivityProfit: string;
  topLocationsTitle: string;
  topLocationsSubtitle: string;
  promotersLeaderboardTitle: string;
  promotersLeaderboardSubtitle: string;

  // Sales Calendar View
  calendarTitle: string;
  calendarSubtitle: string;
  viewDays: string;
  viewWeeks: string;
  prevMonth: string;
  nextMonth: string;
  daySummaryTitle: string;
  daySummaryOps: string;
  daySummaryPax: string;
  daySummarySales: string;
  daySummaryProfit: string;
  daySummaryNoOps: string;
  daySummaryViewOps: string;
  dayMon: string;
  dayTue: string;
  dayWed: string;
  dayThu: string;
  dayFri: string;
  daySat: string;
  daySun: string;

  // Business Guide & Formulas Modal
  guideModalTitle: string;
  guideModalSubtitle: string;
  financialFormulasTitle: string;
  formulaSubtotalOver: string;
  formulaSubtotalOverDesc: string;
  formulaNetCommission: string;
  formulaNetCommissionDesc: string;
  formulaCommissionSplit: string;
  formulaCommissionSplitDesc: string;
  formulaDockFee: string;
  formulaDockFeeDesc: string;
  glossaryTitle: string;

  // Operation Detail Modal
  voucherTitle: string;
  voucherFolio: string;
  voucherFinancialBreakdown: string;
  voucherSaleAmount: string;
  voucherDirectCost: string;
  voucherPromoterCommission: string;
  voucherHouseYield: string;
  voucherDockFee: string;
  voucherDepositPaid: string;
  voucherPendingBalance: string;
  voucherTripDetails: string;

  // Security Certificates Modal
  certsModalTitle: string;
  certsModalSubtitle: string;

  // Sheet Reconciliation Modal
  auditModalTitle: string;
  auditModalSubtitle: string;
  auditSubTabRows: string;
  auditSubTabFormulas: string;
}

const translations: Record<Language, Translations> = {
  es: {
    // Common
    allWeeks: 'Todas las Semanas',
    week: 'Semana',
    loading: 'Cargando...',
    refresh: 'Actualizar',
    export: 'Exportar',
    close: 'Cerrar',
    save: 'Guardar',
    status: 'Estatus',
    search: 'Buscar',
    actions: 'Acciones',
    total: 'Total',
    operations: 'Operaciones',
    pax: 'Pasajeros',
    date: 'Fecha',
    moneda: 'Moneda',
    amount: 'Monto',
    notes: 'Notas',
    vendor: 'Proveedor',
    promoter: 'Promotor',
    location: 'Locación',
    hours: 'Horas',
    folio: 'Folio',
    liquidated: 'Liquidado',
    pending: 'Pendiente',
    collected: 'Cobrado',

    // Header & Navigation
    brandMarina: 'MARINA',
    sheetsConnected: 'Google Sheets Conectado',
    localData: 'Datos Locales',
    guideAndFormulas: 'Guía & Fórmulas',
    sheetAudit: 'Auditoría Sheet',
    exportCsv: 'Exportar',
    tabDashboard: 'Dashboard Overview',
    tabOperations: 'Operaciones & Logística',
    tabExecutive: 'Reporte Ejecutivo Marina',
    tabCalendar: 'Calendario & Ventas',
    filterByWeek: 'Filtrar por Semana',
    selectWeekPlaceholder: 'Seleccionar semana',
    langEs: 'ES',
    langEn: 'EN',
    switchLangTitle: 'Cambiar idioma / Switch language',

    // Hero & Overview
    heroTitle: 'Centro de Inteligencia Operativa y Financiera',
    heroSubtitle: 'Control integral de zarpes, bitácoras de yates de lujo, cálculo exacto de muellaje, comisiones y rentabilidad consolidada en tiempo real.',
    quickStatRevenue: 'Ingresos Totales Brutos',
    quickStatProfit: 'Utilidad Operativa Neta',
    quickStatOps: 'Operaciones Marítimas',
    quickStatPax: 'Total Pasajeros (PAX)',

    // KPI Metric Cards
    cardRevenueTitle: 'Ingresos Totales',
    cardRevenueSub: 'Ventas brutas de tours + muellaje',
    cardCostsTitle: 'Costos Directos con Over',
    cardCostsSub: 'Costo de proveedores + margen over',
    cardProfitTitle: 'Utilidad Operativa',
    cardProfitSub: 'Ingresos − Costos directos − Comisiones',
    cardCommissionsTitle: 'Total de comisiones de vendedores',
    cardCommissionsSub: 'Comisión neta dividida entre 2 (50% promotores)',
    cardDockTitle: 'Muellaje Recaudado',
    cardDockSub: 'Derecho de muelle y pernotas',
    cardCollectionsTitle: 'Cobranza & Liquidación',
    cardCollectionsSub: 'Estatus de depósitos y cobros',
    currencyModeAllMxn: 'Todo en MXN',
    currencyModeSplit: 'Separado (USD / MXN)',
    currencyModeUsdEquiv: 'Equivalente USD',

    // Operations Table
    opsTableTitle: 'Bitácora de Operaciones & Zarpes',
    opsTableSubtitle: 'Monitoreo de salidas náuticas, validación de muellaje y comisiones',
    viewOperative: 'Vista Operativa',
    viewFinancial: 'Vista Financiera',
    viewAudit: 'Vista Auditoría',
    colFolio: 'Folio / Cupón',
    colActivity: 'Actividad',
    colService: 'Servicio / Embarcación',
    colPax: 'PAX (Adultos.Niños.Infantes)',
    colDate: 'Fecha Reserva',
    colOperationDate: 'Fecha Salida',
    colVendor: 'Proveedor',
    colPromoter: 'Promotor / Vendedor',
    colLocation: 'Locación',
    colSale: 'Venta',
    colCost: 'Costo Neto',
    colOver: 'Over',
    colCommission: 'Comisión Vendedor',
    colHouse: 'Utilidad Casa',
    colMargin: 'Margen %',
    colDeposit: 'Depósito',
    colBalance: 'Saldo Pendiente',
    colDockFee: 'Muellaje',
    colHours: 'Horas',
    colNotes: 'Notas Operativas',
    colPaymentStatus: 'Estatus Cobro',
    colWeek: 'Semana',
    searchPlaceholder: 'Buscar por folio, cupón, cliente, embarcación, promotor...',
    noRecordsFound: 'No se encontraron operaciones con los filtros seleccionados.',
    showingRecords: 'Mostrando',
    of: 'de',
    page: 'Página',
    previous: 'Anterior',
    next: 'Siguiente',

    // Executive Summary View
    execTitle: 'Reporte Ejecutivo Marina',
    execSubtitle: 'Consolidación financiera marítima, márgenes operativos y auditoría de muellaje',
    downloadPdfButton: 'Descargar Reporte en PDF',
    downloadingPdf: 'Generando PDF Ejecutivo...',
    execKpiRevenue: 'Ingresos Totales (Venta + Muelle)',
    execKpiProfit: 'Utilidad Operativa Neta',
    execKpiMargin: 'Margen Operativo General',
    execKpiOperations: 'Zarpes / Operaciones Realizadas',
    execKpiPax: 'Pasajeros Atendidos (PAX)',
    execKpiCommissions: 'Comisiones de Vendedores (50%)',
    waterfallTitle: 'Desglose Financiero & Cascada de Rentabilidad',
    waterfallSubtitle: 'Conciliación exacta de ingresos, costos directos, comisiones y utilidad',
    conceptCol: 'Concepto Operativo / Financiero',
    formulaCol: 'Fórmula Aplicada',
    amountCol: 'Monto (MXN)',
    pctRevenueCol: '% de Ingresos',
    topActivitiesTitle: 'Rentabilidad por Tipo de Actividad Náutica',
    topActivitiesSubtitle: 'Desempeño comercial por categoría de servicio',
    colActivityTrips: 'Salidas',
    colActivityRevenue: 'Ingresos MXN',
    colActivityProfit: 'Utilidad MXN',
    topLocationsTitle: 'Distribución por Punto de Venta / Locación',
    topLocationsSubtitle: 'Ventas y afluencia por módulo comercial',
    promotersLeaderboardTitle: 'Rendimiento y Comisiones por Promotor',
    promotersLeaderboardSubtitle: 'Volumen de ventas y comisiones calculadas al 50%',

    // Sales Calendar View
    calendarTitle: 'Calendario de Ventas & Control de Operación',
    calendarSubtitle: 'Explora ventas, zarpes y métricas organizadas día por día o por semana.',
    viewDays: 'Ver Días',
    viewWeeks: 'Ver solo por Semanas',
    prevMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    daySummaryTitle: 'Resumen del Día',
    daySummaryOps: 'operaciones registradas',
    daySummaryPax: 'Pasajeros Totales',
    daySummarySales: 'Ventas del Día',
    daySummaryProfit: 'Utilidad del Día',
    daySummaryNoOps: 'Sin operaciones registradas en este día.',
    daySummaryViewOps: 'Filtrar operaciones de este día en la tabla',
    dayMon: 'Lun',
    dayTue: 'Mar',
    dayWed: 'Mié',
    dayThu: 'Jue',
    dayFri: 'Vie',
    daySat: 'Sáb',
    daySun: 'Dom',

    // Business Guide & Formulas Modal
    guideModalTitle: 'Guía Oficial de Llenado, Fórmulas & Glosario',
    guideModalSubtitle: 'Cancun Lighthouse Marina — Manual Operativo',
    financialFormulasTitle: 'Fórmulas Financieras Oficiales',
    formulaSubtotalOver: '1. Subtotal con Over',
    formulaSubtotalOverDesc: '= Costo Reporte Neto + Over (Costo directo real para la empresa).',
    formulaNetCommission: '2. Comisión Neta Repartible',
    formulaNetCommissionDesc: '= Venta − Subtotal con Over (Margen de venta antes de dividir).',
    formulaCommissionSplit: '3. Comisión Vendedor & Utilidad Casa',
    formulaCommissionSplitDesc: '= Comisión Neta / 2 (Reparto 50% vendedor y 50% casa).',
    formulaDockFee: '4. Tarifa de Muellaje',
    formulaDockFeeDesc: '= Total PAX × ($100 ó $150 MXN según duración del zarpe).',
    glossaryTitle: 'Glosario Oficial de Columnas',

    // Operation Detail Modal
    voucherTitle: 'Comprobante Oficial de Zarpe & Operación',
    voucherFolio: 'Folio / Cupón',
    voucherFinancialBreakdown: 'Desglose Financiero & Comisiones',
    voucherSaleAmount: 'Precio Venta al Cliente',
    voucherDirectCost: 'Costo Directo Proveedor',
    voucherPromoterCommission: 'Comisión Promotor (50%)',
    voucherHouseYield: 'Rendimiento Marina Casa (50%)',
    voucherDockFee: 'Derecho de Muelle Recaudado',
    voucherDepositPaid: 'Depósito Pagado',
    voucherPendingBalance: 'Saldo Pendiente',
    voucherTripDetails: 'Detalles Náuticos & Pasajeros',

    // Security Certificates Modal
    certsModalTitle: 'Certificaciones & Sellos de Confianza',
    certsModalSubtitle: 'Cancun Lighthouse Marina • Auditoría y Seguridad Operativa',

    // Sheet Reconciliation Modal
    auditModalTitle: 'Auditoría & Comparativa vs Google Sheet',
    auditModalSubtitle: 'Verificación matemática de filas y concordancia con totales de columnas del Google Sheet',
    auditSubTabRows: 'Auditoría Fila x Fila',
    auditSubTabFormulas: 'Fórmulas de Utilidad & Over'
  },

  en: {
    // Common
    allWeeks: 'All Weeks',
    week: 'Week',
    loading: 'Loading...',
    refresh: 'Refresh',
    export: 'Export',
    close: 'Close',
    save: 'Save',
    status: 'Status',
    search: 'Search',
    actions: 'Actions',
    total: 'Total',
    operations: 'Operations',
    pax: 'Passengers',
    date: 'Date',
    moneda: 'Currency',
    amount: 'Amount',
    notes: 'Notes',
    vendor: 'Vendor / Provider',
    promoter: 'Promoter / Sales Agent',
    location: 'Location',
    hours: 'Hours',
    folio: 'Voucher #',
    liquidated: 'Paid / Settled',
    pending: 'Pending',
    collected: 'Collected',

    // Header & Navigation
    brandMarina: 'MARINA',
    sheetsConnected: 'Google Sheets Connected',
    localData: 'Local Data',
    guideAndFormulas: 'Guide & Formulas',
    sheetAudit: 'Sheet Audit',
    exportCsv: 'Export',
    tabDashboard: 'Dashboard Overview',
    tabOperations: 'Operations & Logistics',
    tabExecutive: 'Marina Executive Report',
    tabCalendar: 'Calendar & Sales',
    filterByWeek: 'Filter by Week',
    selectWeekPlaceholder: 'Select week',
    langEs: 'ES',
    langEn: 'EN',
    switchLangTitle: 'Switch language / Cambiar idioma',

    // Hero & Overview
    heroTitle: 'Operational & Financial Intelligence Center',
    heroSubtitle: 'Comprehensive control of departures, yacht logbooks, exact dock fee calculation, commissions, and real-time consolidated profitability.',
    quickStatRevenue: 'Gross Total Revenue',
    quickStatProfit: 'Net Operating Profit',
    quickStatOps: 'Maritime Operations',
    quickStatPax: 'Total Passengers (PAX)',

    // KPI Metric Cards
    cardRevenueTitle: 'Total Revenue',
    cardRevenueSub: 'Gross tour sales + dock fees',
    cardCostsTitle: 'Direct Costs with Over',
    cardCostsSub: 'Vendor cost + retained over margin',
    cardProfitTitle: 'Operating Profit',
    cardProfitSub: 'Revenue − Direct costs − Commissions',
    cardCommissionsTitle: 'Sales Team Commissions',
    cardCommissionsSub: 'Net commission divided by 2 (50% sales team)',
    cardDockTitle: 'Dock Fees Collected',
    cardDockSub: 'Docking rights and pernota overnight fees',
    cardCollectionsTitle: 'Collections & Settlement',
    cardCollectionsSub: 'Status of customer deposits and receivables',
    currencyModeAllMxn: 'All in MXN',
    currencyModeSplit: 'Split (USD / MXN)',
    currencyModeUsdEquiv: 'USD Equivalent',

    // Operations Table
    opsTableTitle: 'Logbook of Operations & Departures',
    opsTableSubtitle: 'Monitoring of nautical departures, dock fees verification, and sales commissions',
    viewOperative: 'Operations View',
    viewFinancial: 'Financial View',
    viewAudit: 'Audit View',
    colFolio: 'Voucher / Folio',
    colActivity: 'Activity',
    colService: 'Service / Vessel',
    colPax: 'PAX (Adults.Kids.Infants)',
    colDate: 'Booking Date',
    colOperationDate: 'Departure Date',
    colVendor: 'Vendor',
    colPromoter: 'Promoter / Sales Rep',
    colLocation: 'Sales Location',
    colSale: 'Sale Price',
    colCost: 'Net Cost',
    colOver: 'Over',
    colCommission: 'Promoter Commission',
    colHouse: 'Marina Yield',
    colMargin: 'Margin %',
    colDeposit: 'Deposit',
    colBalance: 'Pending Balance',
    colDockFee: 'Dock Fee',
    colHours: 'Hours',
    colNotes: 'Operational Notes',
    colPaymentStatus: 'Payment Status',
    colWeek: 'Week',
    searchPlaceholder: 'Search by voucher, client, vessel, promoter, vendor...',
    noRecordsFound: 'No operations found matching the selected filters.',
    showingRecords: 'Showing',
    of: 'of',
    page: 'Page',
    previous: 'Previous',
    next: 'Next',

    // Executive Summary View
    execTitle: 'Marina Executive Report',
    execSubtitle: 'Consolidated maritime financial performance, operating margins, and dock fee audit',
    downloadPdfButton: 'Download PDF Report',
    downloadingPdf: 'Generating Executive PDF...',
    execKpiRevenue: 'Total Revenue (Sales + Dock)',
    execKpiProfit: 'Net Operating Profit',
    execKpiMargin: 'Overall Operating Margin',
    execKpiOperations: 'Departures / Completed Trips',
    execKpiPax: 'Passengers Served (PAX)',
    execKpiCommissions: 'Sales Commissions Paid (50%)',
    waterfallTitle: 'Financial Waterfall & Profit Breakdown',
    waterfallSubtitle: 'Exact reconciliation of revenues, direct costs, commissions, and net profit',
    conceptCol: 'Financial / Operational Concept',
    formulaCol: 'Applied Formula',
    amountCol: 'Amount (MXN)',
    pctRevenueCol: '% of Revenue',
    topActivitiesTitle: 'Profitability by Nautical Activity Type',
    topActivitiesSubtitle: 'Commercial performance by service category',
    colActivityTrips: 'Trips',
    colActivityRevenue: 'Revenue MXN',
    colActivityProfit: 'Profit MXN',
    topLocationsTitle: 'Distribution by Point of Sale / Location',
    topLocationsSubtitle: 'Sales volume and footfall by commercial booth',
    promotersLeaderboardTitle: 'Promoter Performance & Commissions',
    promotersLeaderboardSubtitle: 'Sales volume and commissions calculated at 50%',

    // Sales Calendar View
    calendarTitle: 'Sales Calendar & Operations Control',
    calendarSubtitle: 'Explore sales, departures, and performance metrics day-by-day or by week.',
    viewDays: 'View Days',
    viewWeeks: 'View Weeks Only',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    daySummaryTitle: 'Daily Performance Summary',
    daySummaryOps: 'recorded departures',
    daySummaryPax: 'Total Passengers',
    daySummarySales: 'Daily Sales',
    daySummaryProfit: 'Daily Profit',
    daySummaryNoOps: 'No operations recorded on this date.',
    daySummaryViewOps: 'Filter these daily operations in table',
    dayMon: 'Mon',
    dayTue: 'Tue',
    dayWed: 'Wed',
    dayThu: 'Thu',
    dayFri: 'Fri',
    daySat: 'Sat',
    daySun: 'Sun',

    // Business Guide & Formulas Modal
    guideModalTitle: 'Official Operations Guide, Formulas & Glossary',
    guideModalSubtitle: 'Cancun Lighthouse Marina — Operational Standard',
    financialFormulasTitle: 'Official Financial Formulas',
    formulaSubtotalOver: '1. Subtotal with Over',
    formulaSubtotalOverDesc: '= Net Vendor Cost + Over (Real direct cost incurred by company).',
    formulaNetCommission: '2. Distributable Net Commission',
    formulaNetCommissionDesc: '= Sale Price − Subtotal with Over (Gross sales margin before split).',
    formulaCommissionSplit: '3. Promoter Commission & House Yield',
    formulaCommissionSplitDesc: '= Net Commission / 2 (50% sales rep / 50% marina house split).',
    formulaDockFee: '4. Dockage Fee Tariff',
    formulaDockFeeDesc: '= Total PAX × ($100 or $150 MXN depending on trip duration).',
    glossaryTitle: 'Official Column Glossary',

    // Operation Detail Modal
    voucherTitle: 'Official Departure & Trip Voucher',
    voucherFolio: 'Voucher / Folio',
    voucherFinancialBreakdown: 'Financial Breakdown & Commissions',
    voucherSaleAmount: 'Customer Sale Price',
    voucherDirectCost: 'Direct Provider Cost',
    voucherPromoterCommission: 'Promoter Commission (50%)',
    voucherHouseYield: 'Marina Yield (50%)',
    voucherDockFee: 'Dock Fee Collected',
    voucherDepositPaid: 'Deposit Paid',
    voucherPendingBalance: 'Pending Balance',
    voucherTripDetails: 'Nautical Trip Details & Passengers',

    // Security Certificates Modal
    certsModalTitle: 'Certifications & Trust Seals',
    certsModalSubtitle: 'Cancun Lighthouse Marina • Operational Audit & Security',

    // Sheet Reconciliation Modal
    auditModalTitle: 'Audit & Reconciliation vs Google Sheet',
    auditModalSubtitle: 'Mathematical verification of rows and strict conformity with Google Sheet column totals',
    auditSubTabRows: 'Row-by-Row Audit',
    auditSubTabFormulas: 'Profit & Over Formulas'
  }
};

export interface LanguageContextType {
  language: Language;
  isEn: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  l: (esText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'clm_marina_language_v1';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'es' || saved === 'en') return saved;
      const navLang = navigator.language.toLowerCase();
      if (navLang.startsWith('en')) return 'en';
    } catch {
      // default
    }
    return 'es';
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      document.documentElement.lang = language;
    } catch {
      // ignore
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'es' ? 'en' : 'es'));
  };

  const isEn = language === 'en';
  const l = (esText: string, enText: string) => (isEn ? enText : esText);

  return (
    <LanguageContext.Provider
      value={{
        language,
        isEn,
        setLanguage,
        toggleLanguage,
        t: translations[language],
        l
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
