/**
 * Utilities for parsing and formatting dates from the Marina Google Sheet (e.g. "20-jul-2026", "16-sept-2026")
 */

const SPANISH_MONTHS: Record<string, number> = {
  ene: 0,
  enero: 0,
  feb: 1,
  febrero: 1,
  mar: 2,
  marzo: 2,
  abr: 3,
  abril: 3,
  may: 4,
  mayo: 4,
  jun: 5,
  junio: 5,
  jul: 6,
  julio: 6,
  ago: 7,
  agosto: 7,
  sep: 8,
  sept: 8,
  septiembre: 8,
  oct: 9,
  octubre: 9,
  nov: 10,
  noviembre: 10,
  dic: 11,
  diciembre: 11
};

export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAY_NAMES_ES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export const WEEKDAY_NAMES_EN = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const WEEKDAY_SHORT_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const WEEKDAY_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Parses a date string like "20-jul-2026" or "16-sept-2026" into a Date object.
 */
export function parseMexicanDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.trim().toLowerCase();
  const parts = clean.split(/[-/\s.]+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthKey = parts[1];
    const year = parseInt(parts[2], 10);
    const month = SPANISH_MONTHS[monthKey];
    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      const fullYear = year < 100 ? 2000 + year : year;
      return new Date(fullYear, month, day);
    }
  }
  // Try standard ISO or new Date fallback
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Formats a Date to ISO date string "YYYY-MM-DD"
 */
export function toISODateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a Date to a human readable Mexican Spanish string, e.g. "Sábado 15 de Agosto de 2026"
 */
export function formatFullMexicanDate(date: Date): string {
  const weekday = WEEKDAY_NAMES_ES[date.getDay()];
  const day = date.getDate();
  const month = MONTH_NAMES_ES[date.getMonth()];
  const year = date.getFullYear();
  return `${weekday}, ${day} de ${month} de ${year}`;
}

export function formatLocalizedDate(date: Date, lang: 'es' | 'en' = 'es'): string {
  if (lang === 'en') {
    const weekday = WEEKDAY_NAMES_EN[date.getDay()];
    const day = date.getDate();
    const month = MONTH_NAMES_EN[date.getMonth()];
    const year = date.getFullYear();
    return `${weekday}, ${month} ${day}, ${year}`;
  }
  return formatFullMexicanDate(date);
}
