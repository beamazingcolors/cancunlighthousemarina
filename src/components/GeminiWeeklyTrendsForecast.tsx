import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  BrainCircuit, 
  Ship, 
  Users, 
  DollarSign, 
  Compass, 
  ArrowUpRight, 
  ShieldAlert 
} from 'lucide-react';
import { 
  WeeklyTrend, 
  ExecutiveMetrics, 
  GeminiWeeklyAnalysisResponse 
} from '../types/marina';
import { 
  analyzeWeeklyTrendsWithGemini, 
  getCachedWeeklyAnalysis 
} from '../services/geminiService';
import { formatCurrencyMXN, formatPercent, formatNumber } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface GeminiWeeklyTrendsForecastProps {
  weeklyTrends: WeeklyTrend[];
  metrics?: ExecutiveMetrics;
  onForecastAvailable?: (forecast: GeminiWeeklyAnalysisResponse) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const GeminiWeeklyTrendsForecast: React.FC<GeminiWeeklyTrendsForecastProps> = ({
  weeklyTrends,
  metrics,
  onForecastAvailable,
  className = '',
  defaultExpanded = true,
}) => {
  const { language, l } = useLanguage();
  const [analysis, setAnalysis] = useState<GeminiWeeklyAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  // Check initial cache
  useEffect(() => {
    const cached = getCachedWeeklyAnalysis();
    if (cached) {
      setAnalysis(cached);
      if (onForecastAvailable) {
        onForecastAvailable(cached);
      }
    }
  }, [onForecastAvailable]);

  const handleGenerate = async (force: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeWeeklyTrendsWithGemini(weeklyTrends, metrics, force);
      setAnalysis(result);
      if (onForecastAvailable) {
        onForecastAvailable(result);
      }
    } catch (err: any) {
      console.error('Error generating Gemini forecast:', err);
      setError(err?.message || l('Error al conectar con la API de Gemini.', 'Error connecting to Gemini API.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!analysis) return;
    const text = `*CANCUN LIGHTHOUSE MARINA — ${l('RESUMEN EJECUTIVO Y PRONÓSTICO (GEMINI AI)', 'EXECUTIVE SUMMARY & FORECAST (GEMINI AI)')}*
${l('Fecha de generación', 'Generation date')}: ${new Date(analysis.timestamp).toLocaleDateString(language === 'en' ? 'en-US' : 'es-MX')}

*1. ${l('Resumen Ejecutivo', 'Executive Summary')}:*
${analysis.resumenEjecutivo}

*2. ${l(`Pronóstico para ${analysis.pronosticoSiguienteSemana.semanaProyectada}`, `Forecast for ${analysis.pronosticoSiguienteSemana.semanaProyectada}`)}:*
- ${l('Ingresos Proyectados', 'Projected Revenue')}: ${formatCurrencyMXN(analysis.pronosticoSiguienteSemana.ingresosEstimadosMXN)}
- ${l('Utilidad Operativa Estimada', 'Estimated Operating Profit')}: ${formatCurrencyMXN(analysis.pronosticoSiguienteSemana.utilidadEstimadaMXN)}
- ${l('Margen Estimado', 'Estimated Margin')}: ${formatPercent(analysis.pronosticoSiguienteSemana.margenEstimado)}
- ${l('PAX Estimados', 'Estimated PAX')}: ${formatNumber(analysis.pronosticoSiguienteSemana.paxEstimados)} ${l('pasajeros', 'passengers')}
- ${l('Operaciones Estimadas', 'Estimated Trips')}: ${analysis.pronosticoSiguienteSemana.operacionesEstimadas} ${l('salidas', 'departures')}
- ${l('Tendencia', 'Trend')}: ${analysis.pronosticoSiguienteSemana.tendenciaEsperada.toUpperCase()}
- ${l('Justificación', 'Rationale')}: ${analysis.pronosticoSiguienteSemana.justificacion}

*3. ${l('Recomendaciones Operativas', 'Operational Recommendations')}:*
${analysis.recomendacionesOperativas.map(r => `• ${r}`).join('\n')}

*4. ${l('Puntos de Alerta / Control', 'Risk Alerts / Checkpoints')}:*
${analysis.alertasRiesgo.map(a => `⚠ ${a}`).join('\n')}`;

    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  const p = analysis?.pronosticoSiguienteSemana;

  // Trend Badge styling
  const getTrendBadge = (trend?: string) => {
    switch (trend) {
      case 'crecimiento':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            {l('Tendencia de Crecimiento', 'Growth Trend')}
          </span>
        );
      case 'precaucion':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/30">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            {l('Precaución Operativa', 'Operational Caution')}
          </span>
        );
      case 'estable':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            <Minus className="w-4 h-4 text-cyan-400" />
            {l('Operación Estable', 'Stable Operation')}
          </span>
        );
    }
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-md ${
      analysis 
        ? 'bg-gradient-to-br from-[#001733] via-[#002147] to-[#041226] border-[#00A3E0]/30 text-white' 
        : 'bg-white dark:bg-[#0b1728] border-sky-100 dark:border-[#162a4a] text-slate-900 dark:text-white'
    } ${className}`}>
      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A3E0] to-[#007ba8] flex items-center justify-center text-white shadow-md flex-shrink-0">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white dark:text-white flex items-center gap-2">
                {l('Pronóstico Ejecutivo & Proyección Operativa', 'Executive Forecast & Operational Projection')}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-300 dark:text-slate-400 mt-0.5">
              {l(
                `Análisis cuantitativo de las ${weeklyTrends.length} semanas registradas (weeklyTrends) y estimación predictiva para la siguiente semana.`,
                `Quantitative analysis of all ${weeklyTrends.length} recorded weeks and predictive estimate for next week.`
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
          {analysis ? (
            <>
              <button
                type="button"
                onClick={handleCopySummary}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/15"
                title={l('Copiar resumen y pronóstico al portapapeles', 'Copy summary & forecast to clipboard')}
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                <span>{isCopied ? l('¡Copiado!', 'Copied!') : l('Copiar', 'Copy')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerate(true)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-[#00A3E0] hover:bg-[#008ec4] active:scale-95 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title={l('Volver a solicitar análisis fresco a Gemini', 'Request fresh analysis from Gemini')}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? l('Analizando...', 'Analyzing...') : l('Actualizar', 'Refresh')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer border border-white/15"
                title={isExpanded ? l('Contraer panel', 'Collapse panel') : l('Expandir panel', 'Expand panel')}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleGenerate(false)}
              disabled={isLoading || weeklyTrends.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-[#00A3E0] to-[#007ba8] hover:from-[#008ec4] hover:to-[#006891] active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? l('Consultando a Gemini...', 'Consulting Gemini...') : l('Analizar Tendencias con Gemini', 'Analyze Trends with Gemini')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="m-4 sm:m-5 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => handleGenerate(true)}
            className="text-xs font-bold text-rose-300 hover:underline ml-2 cursor-pointer"
          >
            {l('Reintentar', 'Retry')}
          </button>
        </div>
      )}

      {/* Loading state skeleton */}
      {isLoading && !analysis && (
        <div className="p-6 sm:p-8 space-y-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h4 className="text-sm font-bold text-white">{l('Gemini 3.8 Flash está evaluando las tendencias semanales...', 'Gemini 3.8 Flash is analyzing weekly trends...')}</h4>
            <p className="text-xs text-slate-300">
              {l('Procesando correlaciones de ingresos, utilidad operativa, aforo de pasajeros y rendimiento por muellaje para proyectar la semana entrante.', 'Processing correlations in revenue, operating profits, passenger traffic, and dock fees to project the coming week.')}
            </p>
          </div>
        </div>
      )}

      {/* Empty invitation state (if not yet loaded) */}
      {!analysis && !isLoading && !error && (
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-[#071220] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
              {l('Genera una proyección operativa basada en IA', 'Generate an AI-driven operational forecast')}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {l(
                `Se analizarán ${weeklyTrends.length} semanas registradas (${weeklyTrends.map(w => w.semana).join(', ')}) para proyectar la siguiente semana operativa.`,
                `All ${weeklyTrends.length} recorded weeks (${weeklyTrends.map(w => w.semana).join(', ')}) will be analyzed to forecast next week.`
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleGenerate(false)}
            className="px-4 py-2 bg-[#002147] hover:bg-[#001733] text-white dark:bg-[#00A3E0] dark:hover:bg-[#008ec4] text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#00A3E0] dark:text-white" />
            <span>{l('Generar Pronóstico Ahora', 'Generate Forecast Now')}</span>
          </button>
        </div>
      )}

      {/* Main Analysis Display (when loaded and expanded) */}
      {analysis && isExpanded && p && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Executive Summary Narrative */}
          <div className="bg-white/5 dark:bg-black/30 backdrop-blur-xs p-4 sm:p-5 rounded-xl border border-white/10 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>{l('Resumen Ejecutivo de Tendencias Históricas', 'Executive Summary of Historical Trends')}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-normal">
              {analysis.resumenEjecutivo}
            </p>
          </div>

          {/* Hero Projection Card for Next Week */}
          <div className="bg-gradient-to-r from-cyan-950/40 via-sky-950/30 to-blue-950/40 p-5 rounded-2xl border border-cyan-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold block">
                  {l('Pronóstico Operativo Cuantitativo', 'Quantitative Operational Forecast')}
                </span>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{l('Proyección:', 'Projection:')} {p.semanaProyectada}</span>
                </h4>
              </div>
              <div>{getTrendBadge(p.tendenciaEsperada)}</div>
            </div>

            {/* 5 KPI Projection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Projected Revenue */}
              <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-300 uppercase block">{l('Ingresos Proyectados', 'Projected Revenue')}</span>
                <span className="text-base sm:text-lg font-black font-mono text-cyan-300 block mt-0.5">
                  {formatCurrencyMXN(p.ingresosEstimadosMXN)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{l('Ventas + Muellaje', 'Sales + Dockage')}</span>
              </div>

              {/* Projected Profit */}
              <div className="bg-black/40 p-3 rounded-xl border border-emerald-500/30">
                <span className="text-[10px] font-bold text-emerald-300 uppercase block">{l('Utilidad Estimada', 'Estimated Profit')}</span>
                <span className="text-base sm:text-lg font-black font-mono text-emerald-400 block mt-0.5">
                  {formatCurrencyMXN(p.utilidadEstimadaMXN)}
                </span>
                <span className="text-[10px] text-emerald-200/70 block mt-0.5">{l('Margen', 'Margin')} {formatPercent(p.margenEstimado)}</span>
              </div>

              {/* Margen */}
              <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-300 uppercase block">{l('Margen Operativo', 'Operating Margin')}</span>
                <span className="text-base sm:text-lg font-black font-mono text-sky-300 block mt-0.5">
                  {formatPercent(p.margenEstimado)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{l('Rentabilidad Neta', 'Net Profitability')}</span>
              </div>

              {/* Projected PAX */}
              <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-300 uppercase block">{l('PAX Proyectados', 'Projected PAX')}</span>
                <span className="text-base sm:text-lg font-black font-mono text-amber-300 block mt-0.5">
                  {formatNumber(p.paxEstimados)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{l('Aforo estimado', 'Estimated passengers')}</span>
              </div>

              {/* Projected Operations */}
              <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-300 uppercase block">{l('Salidas / Operaciones', 'Trips / Operations')}</span>
                <span className="text-base sm:text-lg font-black font-mono text-white block mt-0.5">
                  {p.operacionesEstimadas}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{l('Charters & Tours', 'Charters & Tours')}</span>
              </div>
            </div>

            {/* Justification Box */}
            <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-cyan-300 block text-[11px] uppercase tracking-wider">
                {l('Fundamentación Operativa del Pronóstico:', 'Operational Basis of the Forecast:')}
              </span>
              <p className="leading-relaxed">{p.justificacion}</p>
            </div>
          </div>

          {/* Key Trend Observations Grid */}
          {analysis.tendenciasClave && analysis.tendenciasClave.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>{l('Patrones y Tendencias Clave Observadas', 'Observed Key Patterns & Trends')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {analysis.tendenciasClave.map((item, idx) => (
                  <div key={idx} className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">{item.indicador}</span>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        item.impacto === 'positivo'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : item.impacto === 'alerta'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                      }`}>
                        {item.impacto}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">{item.comportamiento}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operational Recommendations & Risk Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recommendations */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{l('Recomendaciones Operativas Tácticas', 'Tactical Operational Recommendations')}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {analysis.recomendacionesOperativas.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk & Control Alerts */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>{l('Puntos de Control & Alertas Prioritarias', 'Checkpoints & Priority Risk Alerts')}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {analysis.alertasRiesgo.map((alert, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer info */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10 gap-2">
            <span>
              {l('Generado con Gemini 3.8 Flash •', 'Generated with Gemini 3.8 Flash •')} {new Date(analysis.timestamp).toLocaleTimeString(language === 'en' ? 'en-US' : 'es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-slate-400">
              {l('Datos fuente: Histórico semanal normalizado de Cancún Lighthouse Marina', 'Source data: Normalized weekly records from Cancun Lighthouse Marina')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
