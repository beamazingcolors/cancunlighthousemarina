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
