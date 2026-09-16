import { 
  OperationRecord, 
  ExecutiveMetrics, 
  DetailedFinancialMetrics,
  ExchangeRateRowAudit,
  ActivitySummary, 
  LocationSummary, 
  PromoterSummary, 
  WeeklyTrend 
} from '../types/marina';
import { parsePax } from '../utils/paxUtils';
import { INITIAL_TSV_DATA } from '../data/initialTsv';

const LIVE_TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHr_YZ4y1-Ww6JKAerEWp1jCp07k3SZkiZcYx47A55PRA7dM-0DLzRMeJgplZbAwLDxswE2sVN9L-U/pub?gid=1624494179&single=true&output=tsv';

/**
 * Parses numeric strings from Google Sheets:
 * "$12.000" => 12000
 * "$1.500" => 1500
 * "$150" => 150
 * "($150)" => -150
 * "($75)" => -75
 * "18,00" => 18
 * "15,7%" => 15.7
 * "-" or empty => 0
 */
export function parseSpreadsheetNumber(val: string | undefined | null): number {
  if (!val) return 0;
  const str = String(val).trim();
  if (!str || str === '-' || str === 'N/A') return 0;

  // Check negative formatted in parentheses: ($150), ($75)
  let isNeg = false;
  let clean = str;
  if (clean.startsWith('(') && clean.endsWith(')')) {
    isNeg = true;
    clean = clean.slice(1, -1).trim();
  }

  // Remove currency symbol, spaces, and %
  clean = clean.replace(/[$ %]/g, '').trim();

  let num = 0;
  // If format has comma as decimal: e.g. "18,00" -> 18, "24,6" -> 24.6
  if (clean.includes(',')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
    num = parseFloat(clean) || 0;
  } else if (/^\d+(\.\d{3})+$/.test(clean) || /^\d+\.\d{3}$/.test(clean)) {
    // Thousands dot separator e.g. 12.000, 1.500, 236.886
    clean = clean.replace(/\./g, '');
    num = parseFloat(clean) || 0;
  } else {
    num = parseFloat(clean) || 0;
  }

  return isNeg ? -num : num;
}

export function parseMarinaTSV(tsvString: string): OperationRecord[] {
  const lines = tsvString.trim().split('\n');
  if (lines.length <= 1) return [];

  const headers = lines[0].split('\t').map(h => h.trim());
  const records: OperationRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const cols = line.split('\t');
    // Check if row has meaningful data
    const actividad = (cols[0] || '').trim();
    const servicio = (cols[1] || '').trim();
    if (!actividad && !servicio) continue;

    const paxRaw = (cols[2] || '').trim();
    const pax = parsePax(paxRaw);

    const diaReserva = (cols[3] || '').trim();
    const diaOperacion = (cols[4] || '').trim();
    const proveedor = (cols[5] || '').trim();

    const costoReporteNeto = parseSpreadsheetNumber(cols[6]);
    const monedaRaw = (cols[7] || '').trim().toUpperCase();
    const moneda: 'MXN' | 'USD' = monedaRaw === 'USD' ? 'USD' : 'MXN';
    const tipoCambio = cols[8] && cols[8].trim() !== '-' ? parseSpreadsheetNumber(cols[8]) : null;

    const over = parseSpreadsheetNumber(cols[9]);
    const subtotalConOver = parseSpreadsheetNumber(cols[10]);
    const venta = parseSpreadsheetNumber(cols[11]);
    const comisionNeta = parseSpreadsheetNumber(cols[12]);
    const comision = parseSpreadsheetNumber(cols[13]);
    const casa = parseSpreadsheetNumber(cols[14]);
    const deposito = parseSpreadsheetNumber(cols[15]);
    const balance = parseSpreadsheetNumber(cols[16]);
    const total = parseSpreadsheetNumber(cols[17]);
    const cupon = (cols[18] || '').trim();
    const locacion = (cols[19] || '').trim() || 'Lighthouse';
    const promotor = (cols[20] || '').trim();
    const muelle = parseSpreadsheetNumber(cols[21]);
    const horas = parseSpreadsheetNumber(cols[22]);
    const notas = (cols[23] || '').trim();

    // Computed MXN columns
    const ventaMXN = cols[24] ? parseSpreadsheetNumber(cols[24]) : (moneda === 'USD' && tipoCambio ? venta * tipoCambio : venta);
    const costoTotalMXN = cols[25] ? parseSpreadsheetNumber(cols[25]) : (moneda === 'USD' && tipoCambio ? subtotalConOver * tipoCambio : subtotalConOver);
    const comisionMXN = cols[26] ? parseSpreadsheetNumber(cols[26]) : (moneda === 'USD' && tipoCambio ? comision * tipoCambio : comision);
    const ingresoMuelleMXN = cols[27] ? parseSpreadsheetNumber(cols[27]) : muelle;
    const ingresosTotalesMXN = cols[28] ? parseSpreadsheetNumber(cols[28]) : (ventaMXN + ingresoMuelleMXN);
    const utilidadOperativaMXN = cols[29] ? parseSpreadsheetNumber(cols[29]) : (ingresosTotalesMXN - costoTotalMXN - comisionMXN);
    const margenOperativo = cols[30] ? parseSpreadsheetNumber(cols[30]) : (ingresosTotalesMXN > 0 ? (utilidadOperativaMXN / ingresosTotalesMXN) * 100 : 0);

    const estatusCobroRaw = (cols[31] || '').trim();
    let estatusCobro: 'Liquidado' | 'Pendiente' | 'Otro' = 'Liquidado';
    if (estatusCobroRaw.toLowerCase().includes('pendiente') || balance > 0) {
      estatusCobro = 'Pendiente';
    } else if (estatusCobroRaw.toLowerCase().includes('liquidado')) {
      estatusCobro = 'Liquidado';
    }

    const semana = (cols[32] || '').trim() || 'General';

    // Definición de Tipo de Cambio y Conversión
    // Si la columna dice USD significa que la venta fue en dólares
    // Si está en MXN significa que la venta fue en pesos mexicanos
    const monedaOriginal: 'USD' | 'MXN' = moneda;
    const tipoCambioAplicado: number = (tipoCambio && tipoCambio > 0) ? tipoCambio : 18.0;
    const tipoCambioFuente: 'Fila' | 'Referencia' = (tipoCambio && tipoCambio > 0) ? 'Fila' : 'Referencia';

    let ventaUSD = 0;
    let costoUSD = 0;
    let comisionUSD = 0;
    let utilidadUSD = 0;
    let formulaConversion = '';

    if (moneda === 'USD') {
      ventaUSD = venta;
      costoUSD = subtotalConOver;
      comisionUSD = comision;
      utilidadUSD = casa;
      formulaConversion = `$${venta.toLocaleString('en-US')} USD × ${tipoCambioAplicado.toFixed(2)} = $${ventaMXN.toLocaleString('es-MX')} MXN`;
    } else {
      ventaUSD = tipoCambioAplicado > 0 ? ventaMXN / tipoCambioAplicado : 0;
      costoUSD = tipoCambioAplicado > 0 ? costoTotalMXN / tipoCambioAplicado : 0;
      comisionUSD = tipoCambioAplicado > 0 ? comisionMXN / tipoCambioAplicado : 0;
      utilidadUSD = tipoCambioAplicado > 0 ? utilidadOperativaMXN / tipoCambioAplicado : 0;
      formulaConversion = `$${ventaMXN.toLocaleString('es-MX')} MXN ÷ ${tipoCambioAplicado.toFixed(2)} = $${ventaUSD.toFixed(2)} USD`;
    }

    records.push({
      id: `op-${i}-${cupon || 'folio'}-${actividad}`,
      rowIndex: i,
      actividad,
      servicio,
      pax,
      paxRaw,
      diaReserva,
      diaOperacion,
      proveedor,
      costoReporteNeto,
      moneda,
      tipoCambio,
      over,
      subtotalConOver,
      venta,
      comisionNeta,
      comision,
      casa,
      deposito,
      balance,
      total,
      cupon,
      locacion,
      promotor,
      muelle,
      horas,
      notas,
      ventaMXN,
      costoTotalMXN,
      comisionMXN,
      ingresoMuelleMXN,
      ingresosTotalesMXN,
      utilidadOperativaMXN,
      margenOperativo,
      estatusCobro,
      semana,
      monedaOriginal,
      tipoCambioAplicado,
      tipoCambioFuente,
      ventaUSD,
      costoUSD,
      comisionUSD,
      utilidadUSD,
      formulaConversion
    });
  }

  return records;
}

export async function fetchMarinaData(): Promise<{
  records: OperationRecord[];
  lastFetched: Date;
  isLive: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(LIVE_TSV_URL, {
      cache: 'no-store',
      headers: {
        'Accept': 'text/tab-separated-values, text/plain'
      }
    });

    if (res.ok) {
      const text = await res.text();
      if (text && text.includes('Actividad')) {
        const records = parseMarinaTSV(text);
        if (records.length > 0) {
          return {
            records,
            lastFetched: new Date(),
            isLive: true
          };
        }
      }
    }
    throw new Error('Fallback to bundled snapshot');
  } catch (err: any) {
    console.warn('Using bundled initial TSV data:', err.message);
    const records = parseMarinaTSV(INITIAL_TSV_DATA);
    return {
      records,
      lastFetched: new Date(),
      isLive: false,
      error: err.message
    };
  }
}

export function calculateExecutiveMetrics(records: OperationRecord[]): ExecutiveMetrics {
  let totalIngresosMXN = 0;
  let totalCostosDirectosMXN = 0;
  let totalComisionesMXN = 0;
  let totalUtilidadOperativaMXN = 0;
  let totalCasaMXN = 0;
  let totalVentasDepositadasMXN = 0;
  let totalSaldoPendienteMXN = 0;
  let totalIngresoMuelleMXN = 0;
  let totalPax = 0;
  let totalAdultos = 0;
  let totalNinos = 0;
  let totalInfantes = 0;
  let operacionesLiquidadas = 0;
  let operacionesPendientes = 0;

  for (const r of records) {
    totalIngresosMXN += r.ingresosTotalesMXN;
    totalCostosDirectosMXN += r.costoTotalMXN;
    totalComisionesMXN += r.comisionMXN;
    totalUtilidadOperativaMXN += r.utilidadOperativaMXN;
    totalCasaMXN += r.casa;
    totalVentasDepositadasMXN += r.deposito;
    totalSaldoPendienteMXN += r.balance;
    totalIngresoMuelleMXN += r.ingresoMuelleMXN;

    totalPax += r.pax.total;
    totalAdultos += r.pax.adults;
    totalNinos += r.pax.children;
    totalInfantes += r.pax.infants;

    if (r.estatusCobro === 'Liquidado') {
      operacionesLiquidadas++;
    } else {
      operacionesPendientes++;
    }
  }

  const margenOperativoPromedio = totalIngresosMXN > 0
    ? (totalUtilidadOperativaMXN / totalIngresosMXN) * 100
    : 0;

  const totalVentaTotal = totalVentasDepositadasMXN + totalSaldoPendienteMXN;
  const tasaCobranza = totalVentaTotal > 0 ? (totalVentasDepositadasMXN / totalVentaTotal) * 100 : 0;

  return {
    totalIngresosMXN,
    totalCostosDirectosMXN,
    totalComisionesMXN,
    totalUtilidadOperativaMXN,
    margenOperativoPromedio,
    totalCasaMXN,
    totalVentasDepositadasMXN,
    totalSaldoPendienteMXN,
    totalIngresoMuelleMXN,
    totalOperaciones: records.length,
    totalPax,
    totalAdultos,
    totalNinos,
    totalInfantes,
    operacionesLiquidadas,
    operacionesPendientes,
    tasaCobranza
  };
}

export function calculateDetailedFinancialMetrics(records: OperationRecord[]): DetailedFinancialMetrics {
  let usdRecordsCount = 0;
  let usdTotalVentas = 0;
  let usdTotalCostos = 0;
  let usdTotalOver = 0;
  let usdTotalCasa = 0;
  let usdTotalComisiones = 0;
  let usdTotalMuelle = 0;

  let usdTotalVentasConvertidasMXN = 0;
  let usdTotalUtilidadConvertidaMXN = 0;
  let usdTotalComisionesConvertidasMXN = 0;

  let mxnRecordsCount = 0;
  let mxnTotalVentas = 0;
  let mxnTotalCostos = 0;
  let mxnTotalOver = 0;
  let mxnTotalCasa = 0;
  let mxnTotalComisiones = 0;
  let mxnTotalMuelle = 0;
  let mxnTotalVentasEquivalenteUSD = 0;

  let totalUtilidadNetaMXN = 0;
  let totalOverMXN = 0;
  let totalCasaMXN = 0;
  let totalComisionesVendedoresMXN = 0;
  let totalMuelleMXN = 0;
  let totalVentasMXN = 0;
  let totalCostosDirectosMXN = 0;

  let sheetIngresosTotalesMXN = 0;
  let sheetCostosDirectosMXN = 0;
  let sheetComisionesMXN = 0;
  let sheetUtilidadOperativaMXN = 0;
  let sheetSaldoPendienteMXN = 0;
  let sheetVentasDepositadasMXN = 0;

  let sumTc = 0;
  let countTc = 0;

  const exchangeRateRows: ExchangeRateRowAudit[] = [];
  const tcGroups: Record<number, { count: number; countUSD: number; countMXN: number; totalVentaMXN: number; totalUtilidadMXN: number }> = {};

  for (const r of records) {
    sheetIngresosTotalesMXN += r.ingresosTotalesMXN;
    sheetCostosDirectosMXN += r.costoTotalMXN;
    sheetComisionesMXN += r.comisionMXN;
    sheetUtilidadOperativaMXN += r.utilidadOperativaMXN;
    sheetSaldoPendienteMXN += r.balance;
    sheetVentasDepositadasMXN += r.deposito;

    const isUSD = r.moneda === 'USD';
    const tc = r.tipoCambioAplicado;

    if (isUSD) {
      usdRecordsCount++;
      usdTotalVentas += r.venta;
      usdTotalCostos += r.costoReporteNeto;
      usdTotalOver += r.over;
      usdTotalCasa += r.casa;
      usdTotalComisiones += r.comision;
      usdTotalMuelle += (r.ingresoMuelleMXN || r.muelle);

      usdTotalVentasConvertidasMXN += r.ventaMXN;
      usdTotalUtilidadConvertidaMXN += r.utilidadOperativaMXN;
      usdTotalComisionesConvertidasMXN += r.comisionMXN;

      sumTc += tc;
      countTc++;

      // Convert to MXN by multiplying by row's tipoCambio:
      const overMXN = r.over * tc;
      const casaMXN = r.casa * tc;
      const comisionMXN = r.comision * tc;
      const muelleMXN = r.ingresoMuelleMXN || r.muelle;
      const ventaMXN = r.ventaMXN;
      const costoMXN = r.costoTotalMXN;

      totalOverMXN += overMXN;
      totalCasaMXN += casaMXN;
      totalComisionesVendedoresMXN += comisionMXN;
      totalMuelleMXN += muelleMXN;
      totalVentasMXN += ventaMXN;
      totalCostosDirectosMXN += costoMXN;
      // Formula solicitada: Utilidad neta = muelle + over + casa
      totalUtilidadNetaMXN += (muelleMXN + overMXN + casaMXN);
    } else {
      mxnRecordsCount++;
      mxnTotalVentas += r.venta;
      mxnTotalCostos += r.costoReporteNeto;
      mxnTotalOver += r.over;
      mxnTotalCasa += r.casa;
      mxnTotalComisiones += r.comision;
      mxnTotalMuelle += (r.ingresoMuelleMXN || r.muelle);

      mxnTotalVentasEquivalenteUSD += r.ventaUSD;

      totalOverMXN += r.over;
      totalCasaMXN += r.casa;
      totalComisionesVendedoresMXN += r.comision;
      totalMuelleMXN += (r.ingresoMuelleMXN || r.muelle);
      totalVentasMXN += r.venta;
      totalCostosDirectosMXN += r.costoReporteNeto;
      // Formula solicitada: Utilidad neta = muelle + over + casa
      totalUtilidadNetaMXN += ((r.ingresoMuelleMXN || r.muelle) + r.over + r.casa);
    }

    // Auditoría fila a fila de Tipo de Cambio
    const mathMatch = r.moneda === 'USD' 
      ? Math.abs((r.venta * r.tipoCambioAplicado) - r.ventaMXN) < 1.0
      : Math.abs(r.venta - r.ventaMXN) < 1.0;

    exchangeRateRows.push({
      rowIndex: r.rowIndex,
      id: r.id,
      actividad: r.actividad,
      servicio: r.servicio,
      promotor: r.promotor,
      monedaOriginal: r.monedaOriginal,
      tipoCambio: r.tipoCambioAplicado,
      tipoCambioFuente: r.tipoCambioFuente,
      ventaOriginal: r.monedaOriginal === 'USD' ? r.venta : r.ventaMXN,
      costoOriginal: r.monedaOriginal === 'USD' ? r.subtotalConOver : r.costoTotalMXN,
      comisionOriginal: r.monedaOriginal === 'USD' ? r.comision : r.comisionMXN,
      ventaMXN: r.ventaMXN,
      costoMXN: r.costoTotalMXN,
      comisionMXN: r.comisionMXN,
      muelleMXN: r.ingresoMuelleMXN,
      utilidadMXN: r.utilidadOperativaMXN,
      ventaUSD: r.ventaUSD,
      costoUSD: r.costoUSD,
      comisionUSD: r.comisionUSD,
      utilidadUSD: r.utilidadUSD,
      formulaTexto: r.formulaConversion,
      esExacto: mathMatch
    });

    // Distribución por Tipo de Cambio
    const tcKey = r.tipoCambioAplicado;
    if (!tcGroups[tcKey]) {
      tcGroups[tcKey] = { count: 0, countUSD: 0, countMXN: 0, totalVentaMXN: 0, totalUtilidadMXN: 0 };
    }
    tcGroups[tcKey].count++;
    if (r.moneda === 'USD') tcGroups[tcKey].countUSD++;
    else tcGroups[tcKey].countMXN++;
    tcGroups[tcKey].totalVentaMXN += r.ventaMXN;
    tcGroups[tcKey].totalUtilidadMXN += r.utilidadOperativaMXN;
  }

  const tcDistribution = Object.keys(tcGroups)
    .map(k => Number(k))
    .sort((a, b) => a - b)
    .map(tc => ({
      tc,
      label: `$${tc.toFixed(2)} MXN/USD`,
      ...tcGroups[tc]
    }));

  const usdTotalUtilidadNeta = usdTotalMuelle + usdTotalOver + usdTotalCasa;
  const mxnTotalUtilidadNeta = mxnTotalMuelle + mxnTotalOver + mxnTotalCasa;

  const totalIngresosBrutosMXN = totalVentasMXN + totalMuelleMXN;
  const totalEgresosMXN = totalCostosDirectosMXN + totalComisionesVendedoresMXN;
  const margenUtilidadNeta = totalIngresosBrutosMXN > 0
    ? (totalUtilidadNetaMXN / totalIngresosBrutosMXN) * 100
    : 0;

  const margenOperativoSheet = sheetIngresosTotalesMXN > 0
    ? (sheetUtilidadOperativaMXN / sheetIngresosTotalesMXN) * 100
    : 0;

  const promedioTipoCambio = countTc > 0 ? (sumTc / countTc) : 18.0;

  return {
    totalUtilidadNetaMXN,
    totalOverMXN,
    totalCasaMXN,
    totalComisionesVendedoresMXN,
    totalMuelleMXN,
    totalVentasMXN,
    totalCostosDirectosMXN,
    totalEgresosMXN,
    totalIngresosBrutosMXN,
    margenUtilidadNeta,
    totalUtilidadOperativaSheetMXN: sheetUtilidadOperativaMXN,
    sheetIngresosTotalesMXN,
    sheetCostosDirectosMXN,
    sheetComisionesMXN,
    sheetUtilidadOperativaMXN,
    sheetSaldoPendienteMXN,
    sheetVentasDepositadasMXN,
    margenOperativoSheet,
    usdRecordsCount,
    usdTotalVentas,
    usdTotalCostos,
    usdTotalOver,
    usdTotalCasa,
    usdTotalComisiones,
    usdTotalMuelle,
    usdTotalUtilidadNeta,
    usdTotalVentasConvertidasMXN,
    usdTotalUtilidadConvertidaMXN,
    usdTotalComisionesConvertidasMXN,
    mxnRecordsCount,
    mxnTotalVentas,
    mxnTotalCostos,
    mxnTotalOver,
    mxnTotalCasa,
    mxnTotalComisiones,
    mxnTotalMuelle,
    mxnTotalUtilidadNeta,
    mxnTotalVentasEquivalenteUSD,
    exchangeRateRows,
    tcDistribution,
    promedioTipoCambio
  };
}

export function getActivitiesSummary(records: OperationRecord[]): ActivitySummary[] {
  const map: Record<string, ActivitySummary> = {};

  for (const r of records) {
    const act = r.actividad || 'Otros';
    if (!map[act]) {
      map[act] = {
        actividad: act,
        operaciones: 0,
        pax: 0,
        ingresosMXN: 0,
        costosMXN: 0,
        utilidadMXN: 0,
        margen: 0,
        comisionesMXN: 0
      };
    }
    map[act].operaciones += 1;
    map[act].pax += r.pax.total;
    map[act].ingresosMXN += r.ingresosTotalesMXN;
    map[act].costosMXN += r.costoTotalMXN;
    map[act].utilidadMXN += r.utilidadOperativaMXN;
    map[act].comisionesMXN += r.comisionMXN;
  }

  return Object.values(map).map(item => ({
    ...item,
    margen: item.ingresosMXN > 0 ? (item.utilidadMXN / item.ingresosMXN) * 100 : 0
  })).sort((a, b) => b.ingresosMXN - a.ingresosMXN);
}

export function getLocationsSummary(records: OperationRecord[]): LocationSummary[] {
  const map: Record<string, LocationSummary> = {};

  for (const r of records) {
    const loc = r.locacion || 'Lighthouse';
    if (!map[loc]) {
      map[loc] = {
        locacion: loc,
        operaciones: 0,
        pax: 0,
        ingresosMXN: 0,
        utilidadMXN: 0,
        margen: 0
      };
    }
    map[loc].operaciones += 1;
    map[loc].pax += r.pax.total;
    map[loc].ingresosMXN += r.ingresosTotalesMXN;
    map[loc].utilidadMXN += r.utilidadOperativaMXN;
  }

  return Object.values(map).map(item => ({
    ...item,
    margen: item.ingresosMXN > 0 ? (item.utilidadMXN / item.ingresosMXN) * 100 : 0
  })).sort((a, b) => b.ingresosMXN - a.ingresosMXN);
}

export function getPromotersSummary(records: OperationRecord[]): PromoterSummary[] {
  const map: Record<string, PromoterSummary> = {};

  for (const r of records) {
    const prom = r.promotor || 'Sin Asignar';
    if (!map[prom]) {
      map[prom] = {
        promotor: prom,
        operaciones: 0,
        ventasMXN: 0,
        comisionMXN: 0,
        utilidadCasaMXN: 0
      };
    }
    map[prom].operaciones += 1;
    map[prom].ventasMXN += r.ventaMXN;
    map[prom].comisionMXN += r.comisionMXN;
    map[prom].utilidadCasaMXN += r.casa;
  }

  return Object.values(map).sort((a, b) => b.ventasMXN - a.ventasMXN);
}

export function getWeeklyTrends(records: OperationRecord[]): WeeklyTrend[] {
  const map: Record<string, WeeklyTrend> = {};

  for (const r of records) {
    const sem = r.semana || 'Sin Semana';
    if (!map[sem]) {
      map[sem] = {
        semana: `Semana ${sem}`,
        operaciones: 0,
        ingresosMXN: 0,
        utilidadMXN: 0,
        pax: 0,
        muelleMXN: 0
      };
    }
    map[sem].operaciones += 1;
    map[sem].ingresosMXN += r.ingresosTotalesMXN;
    map[sem].utilidadMXN += r.utilidadOperativaMXN;
    map[sem].pax += r.pax.total;
    map[sem].muelleMXN += r.ingresoMuelleMXN;
  }

  return Object.values(map).sort((a, b) => {
    const numA = parseInt(a.semana.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.semana.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });
}
