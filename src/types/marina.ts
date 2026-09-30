export interface PaxBreakdown {
  adults: number;
  children: number;
  infants: number;
  total: number;
  raw: string;
}

export interface OperationRecord {
  id: string;
  rowIndex: number;
  actividad: string; // 'Yate' | 'Tour' | 'Marina' | 'Muelle' | 'Pernota' | string
  servicio: string; // 'Lorenzo', 'Regina', 'ATV', 'Buceo', etc.
  pax: PaxBreakdown;
  paxRaw: string;
  diaReserva: string; // '20-jul-2026'
  diaOperacion: string; // '20-jul-2026'
  proveedor: string;
  costoReporteNeto: number;
  moneda: 'MXN' | 'USD';
  tipoCambio: number | null;
  over: number;
  subtotalConOver: number;
  venta: number;
  comisionNeta: number;
  comision: number; // Comisión vendedor
  casa: number; // Utilidad Casa
  deposito: number;
  balance: number;
  total: number;
  cupon: string;
  locacion: string; // 'Lighthouse', 'Fashion Harbor', etc.
  promotor: string;
  muelle: number;
  horas: number;
  notas: string;
  // Normalized MXN computed columns:
  ventaMXN: number;
  costoTotalMXN: number;
  comisionMXN: number;
  ingresoMuelleMXN: number;
  ingresosTotalesMXN: number;
  utilidadOperativaMXN: number;
  margenOperativo: number; // in percentage e.g. 20.3
  estatusCobro: 'Liquidado' | 'Pendiente' | 'Otro';
  semana: string; // '26', '30', '31', etc.
  // Pernota & Anticipos categorization
  isPernota: boolean;
  isAnticipo: boolean;
  isHonorariosOperacion: boolean;
  nombrePersonalOperacion?: 'Gabriel' | 'Alexis' | string;
  montoHonorariosMXN?: number;
  // Currency & Exchange Rate calculation audit fields:
  monedaOriginal: 'USD' | 'MXN';
  tipoCambioAplicado: number;
  tipoCambioFuente: 'Fila' | 'Referencia';
  ventaUSD: number;
  costoUSD: number;
  comisionUSD: number;
  utilidadUSD: number;
  formulaConversion: string;
}

export type CurrencyDisplayMode = 'all_mxn' | 'split' | 'usd';

export interface ExchangeRateRowAudit {
  rowIndex: number;
  id: string;
  actividad: string;
  servicio: string;
  promotor: string;
  monedaOriginal: 'USD' | 'MXN';
  tipoCambio: number;
  tipoCambioFuente: 'Fila' | 'Referencia';
  // Original column values (Cols 10, 11, 13)
  ventaOriginal: number;
  costoOriginal: number;
  comisionOriginal: number;
  // Computed MXN columns (Cols 24, 25, 26, 29)
  ventaMXN: number;
  costoMXN: number;
  comisionMXN: number;
  muelleMXN: number;
  utilidadMXN: number;
  // USD equivalents
  ventaUSD: number;
  costoUSD: number;
  comisionUSD: number;
  utilidadUSD: number;
  formulaTexto: string;
  esExacto: boolean;
}

export interface DetailedFinancialMetrics {
  // Conversión total a pesos (aplicando tipoCambio de cada fila para registros en USD)
  totalUtilidadNetaMXN: number; // muelle + over + casa
  totalOverMXN: number;
  totalCasaMXN: number;
  totalComisionesVendedoresMXN: number; // comision
  totalMuelleMXN: number;
  totalPernotaMXN: number; // Sum of all Pernota & Anticipo entries
  totalPernotaPositivaMXN: number; // Positive pernotas (e.g. Mercedes, White Rum)
  totalPernotaNegativaMXN: number; // Negative deductions / anticipos that subtract (e.g. -$30,000)
  totalMuelleRegularMXN: number; // Regular passenger dock fees
  // Honorarios de Personal Operativo (Anticipo Gabriel & Anticipo Alexis)
  totalHonorariosOperacionMXN: number; // $30,000 MXN descontados
  honorariosGabrielMXN: number; // $20,000 MXN descontados
  honorariosAlexisMXN: number; // $10,000 MXN descontados
  totalVentasMXN: number;
  totalCostosDirectosMXN: number;
  totalEgresosMXN: number; // costos + comisiones
  totalIngresosBrutosMXN: number; // ventas + muelle
  margenUtilidadNeta: number; // (utilidadNeta / ingresosBrutos) * 100

  // Métricas oficiales directas del Google Sheet (Col 24-29)
  totalUtilidadOperativaSheetMXN: number; // Columna 29: Ingresos - Costos con Over - Comisiones
  sheetIngresosTotalesMXN: number; // Columna 28: $399,087
  sheetCostosDirectosMXN: number; // Columna 25: $236,886
  sheetComisionesMXN: number; // Columna 26: $64,164
  sheetUtilidadOperativaMXN: number; // Columna 29: $98,037
  sheetSaldoPendienteMXN: number; // Columna 16: $85,075
  sheetVentasDepositadasMXN: number; // Columna 15: $233,267
  margenOperativoSheet: number; // 24.6%

  // Desglose Dólares (registros en USD)
  usdRecordsCount: number;
  usdTotalVentas: number;
  usdTotalCostos: number;
  usdTotalOver: number;
  usdTotalCasa: number;
  usdTotalComisiones: number;
  usdTotalMuelle: number;
  usdTotalUtilidadNeta: number; // usdMuelle + usdOver + usdCasa
  usdTotalVentasConvertidasMXN: number;
  usdTotalCostosConvertidosMXN: number;
  usdTotalOverConvertidoMXN: number;
  usdTotalUtilidadConvertidaMXN: number;
  usdTotalComisionesConvertidasMXN: number;

  // Desglose Pesos (registros en MXN)
  mxnRecordsCount: number;
  mxnTotalVentas: number;
  mxnTotalCostos: number;
  mxnTotalOver: number;
  mxnTotalCasa: number;
  mxnTotalComisiones: number;
  mxnTotalMuelle: number;
  mxnTotalUtilidadNeta: number; // mxnMuelle + mxnOver + mxnCasa
  mxnTotalVentasEquivalenteUSD: number;

  // Auditoría y Comparativa de Tipos de Cambio
  exchangeRateRows: ExchangeRateRowAudit[];
  tcDistribution: {
    tc: number;
    label: string;
    count: number;
    countUSD: number;
    countMXN: number;
    totalVentaMXN: number;
    totalUtilidadMXN: number;
  }[];

  // Tipo de cambio promedio ponderado
  promedioTipoCambio: number;
}

export interface ExecutiveMetrics {
  totalIngresosMXN: number;
  totalCostosDirectosMXN: number;
  totalComisionesMXN: number;
  totalUtilidadOperativaMXN: number;
  margenOperativoPromedio: number;
  totalCasaMXN: number;
  totalVentasDepositadasMXN: number;
  totalSaldoPendienteMXN: number;
  totalIngresoMuelleMXN: number;
  totalPernotaMXN: number;
  totalPernotaPositivaMXN: number;
  totalPernotaNegativaMXN: number;
  totalMuelleRegularMXN: number;
  // Honorarios de Personal Operativo (Anticipo Gabriel & Anticipo Alexis)
  totalHonorariosOperacionMXN: number;
  honorariosGabrielMXN: number;
  honorariosAlexisMXN: number;
  totalOperaciones: number;
  totalPax: number;
  totalAdultos: number;
  totalNinos: number;
  totalInfantes: number;
  operacionesLiquidadas: number;
  operacionesPendientes: number;
  tasaCobranza: number;
}

export interface FilterState {
  semana: string; // 'ALL' or '30', etc.
  actividad: string; // 'ALL' or 'Yate', etc.
  locacion: string; // 'ALL' or 'Lighthouse', etc.
  promotor: string; // 'ALL' or specific
  proveedor: string; // 'ALL' or specific
  estatusCobro: string; // 'ALL' | 'Liquidado' | 'Pendiente'
  moneda: string; // 'ALL' | 'MXN' | 'USD'
  searchQuery: string;
  dateRange: string; // 'ALL' | 'today' | 'this_week'
}

export interface ActivitySummary {
  actividad: string;
  operaciones: number;
  pax: number;
  ingresosMXN: number;
  costosMXN: number;
  utilidadMXN: number;
  margen: number;
  comisionesMXN: number;
}

export interface LocationSummary {
  locacion: string;
  operaciones: number;
  pax: number;
  ingresosMXN: number;
  utilidadMXN: number;
  margen: number;
}

export interface PromoterSummary {
  promotor: string;
  operaciones: number;
  ventasMXN: number;
  comisionMXN: number;
  utilidadCasaMXN: number;
}

export interface WeeklyTrend {
  semana: string;
  operaciones: number;
  ingresosMXN: number;
  utilidadMXN: number;
  pax: number;
  muelleMXN: number;
}

export interface WeeklyTrendForecast {
  semanaProyectada: string;
  ingresosEstimadosMXN: number;
  utilidadEstimadaMXN: number;
  margenEstimado: number;
  paxEstimados: number;
  operacionesEstimadas: number;
  tendenciaEsperada: 'crecimiento' | 'estable' | 'precaucion';
  justificacion: string;
}

export interface WeeklyTrendKeyInsight {
  indicador: string;
  comportamiento: string;
  impacto: 'positivo' | 'neutral' | 'alerta';
}

export interface GeminiWeeklyAnalysisResponse {
  resumenEjecutivo: string;
  pronosticoSiguienteSemana: WeeklyTrendForecast;
  tendenciasClave: WeeklyTrendKeyInsight[];
  recomendacionesOperativas: string[];
  alertasRiesgo: string[];
  timestamp: string;
}

