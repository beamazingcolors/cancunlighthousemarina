import { 
  OperationRecord, 
  ExecutiveMetrics, 
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
 * "18,00" => 18
 * "15,7%" => 15.7
 * "-" or empty => 0
 */
export function parseSpreadsheetNumber(val: string | undefined | null): number {
  if (!val) return 0;
  const str = String(val).trim();
  if (!str || str === '-' || str === 'N/A') return 0;

  // Remove currency symbol, spaces, and %
  let clean = str.replace(/[$ %]/g, '').trim();

  // If format is like 12.000 (meaning 12000) vs 18.50 (meaning 18.5)
  // Let's check patterns:
  // If has comma as decimal: e.g. "18,00" -> 18, "24,6" -> 24.6
  if (clean.includes(',')) {
    // If it has dot as thousands (e.g. 1.234,56)
    clean = clean.replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  }

  // If it only has dots: e.g. "12.000", "1.500", "150", "18.50"
  // If dot is followed by 3 digits at the end, e.g. 12.000 or 1.500 => thousands separator
  if (/^\d+\.\d{3}$/.test(clean)) {
    clean = clean.replace(/\./g, '');
    return parseFloat(clean) || 0;
  }

  return parseFloat(clean) || 0;
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
      semana
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
