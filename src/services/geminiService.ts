import { WeeklyTrend, ExecutiveMetrics, GeminiWeeklyAnalysisResponse } from '../types/marina';

const CACHE_STORAGE_KEY = 'cancun_lighthouse_gemini_weekly_forecast_cache';

/**
 * Analyzes historical weekly trends using Gemini 3.8 Flash via the backend Express proxy
 * and returns an executive summary with a quantified operational projection for next week.
 */
export async function analyzeWeeklyTrendsWithGemini(
  weeklyTrends: WeeklyTrend[],
  metrics?: ExecutiveMetrics,
  forceRefresh: boolean = false
): Promise<GeminiWeeklyAnalysisResponse> {
  if (!weeklyTrends || weeklyTrends.length === 0) {
    throw new Error('No hay datos suficientes de semanas (weeklyTrends) para analizar.');
  }

  // Check cached forecast if not forced
  if (!forceRefresh) {
    try {
      const cached = sessionStorage.getItem(CACHE_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { data: GeminiWeeklyAnalysisResponse; trendsHash: string };
        const currentHash = `${weeklyTrends.length}-${weeklyTrends.map(w => `${w.semana}:${w.ingresosMXN}`).join('|')}`;
        if (parsed.trendsHash === currentHash && parsed.data) {
          return parsed.data;
        }
      }
    } catch {
      // Ignore cache read failures
    }
  }

  const response = await fetch('/api/gemini/analyze-trends', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      weeklyTrends,
      context: metrics
        ? {
            totalIngresosMXN: metrics.totalIngresosMXN,
            totalCostosDirectosMXN: metrics.totalCostosDirectosMXN,
            totalUtilidadOperativaMXN: metrics.totalUtilidadOperativaMXN,
            margenOperativoPromedio: metrics.margenOperativoPromedio,
            totalPax: metrics.totalPax,
            totalOperaciones: metrics.totalOperaciones,
            tasaCobranza: metrics.tasaCobranza,
            totalSaldoPendienteMXN: metrics.totalSaldoPendienteMXN,
          }
        : undefined,
    }),
  });

  if (!response.ok) {
    let errorMsg = `Error en el servidor al invocar Gemini API (${response.status})`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) {
        errorMsg = errorJson.error;
      }
    } catch {
      // Ignore response parsing errors
    }
    throw new Error(errorMsg);
  }

  const data = (await response.json()) as GeminiWeeklyAnalysisResponse;
  data.timestamp = new Date().toISOString();

  // Save to cache
  try {
    const currentHash = `${weeklyTrends.length}-${weeklyTrends.map(w => `${w.semana}:${w.ingresosMXN}`).join('|')}`;
    sessionStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify({ data, trendsHash: currentHash })
    );
  } catch {
    // Ignore cache write failures
  }

  return data;
}

/**
 * Retrieves the currently cached analysis if available.
 */
export function getCachedWeeklyAnalysis(): GeminiWeeklyAnalysisResponse | null {
  try {
    const cached = sessionStorage.getItem(CACHE_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed.data || null;
    }
  } catch {
    return null;
  }
  return null;
}
