import { PaxBreakdown } from '../types/marina';

/**
 * Parses the custom PAX notation:
 * - "2" => 2 Adults, 0 Children, 0 Infants (Total: 2)
 * - "2.1" => 2 Adults, 1 Child, 0 Infants (Total: 3)
 * - "2.2.1" => 2 Adults, 2 Children, 1 Infant (Total: 5)
 * - "2.0.1" => 2 Adults, 0 Children, 1 Infant (Total: 3)
 * - "13.5" => 13 Adults, 5 Children, 0 Infants (Total: 18)
 */
export function parsePax(raw: string | number | undefined | null): PaxBreakdown {
  if (raw === undefined || raw === null) {
    return { adults: 0, children: 0, infants: 0, total: 0, raw: '0' };
  }

  const str = String(raw).trim();
  if (!str || str === '-' || str === '0') {
    return { adults: 0, children: 0, infants: 0, total: 0, raw: str || '0' };
  }

  const parts = str.split('.').map(p => parseInt(p.trim(), 10) || 0);

  const adults = parts[0] || 0;
  const children = parts.length > 1 ? parts[1] || 0 : 0;
  const infants = parts.length > 2 ? parts[2] || 0 : 0;
  const total = adults + children + infants;

  return {
    adults,
    children,
    infants,
    total: total > 0 ? total : (parseInt(str, 10) || 0),
    raw: str
  };
}

/**
 * Calculates Muelle fee per business rule:
 * - 1 to 3 hours: $100 MXN per pax
 * - 4 to 8 hours: $150 MXN per pax
 */
export function calculateExpectedMuelle(totalPax: number, hours: number): number {
  if (totalPax <= 0) return 0;
  if (hours >= 4) {
    return totalPax * 150;
  }
  if (hours >= 1) {
    return totalPax * 100;
  }
  return 0;
}

/**
 * Formats PAX into human readable label:
 * e.g. "2 Ad · 1 Ni" or "8 Ad" or "2 Ad · 2 Ni · 1 In (5 PAX)"
 */
export function formatPaxDetail(pax: PaxBreakdown): string {
  const parts: string[] = [];
  if (pax.adults > 0) parts.push(`${pax.adults} Ad`);
  if (pax.children > 0) parts.push(`${pax.children} Ni`);
  if (pax.infants > 0) parts.push(`${pax.infants} In`);
  
  if (parts.length === 0) return `${pax.total || 0} PAX`;
  return `${parts.join(' · ')} (${pax.total} total)`;
}
