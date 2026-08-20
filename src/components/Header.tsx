import React from 'react';
import { 
  Anchor, 
  RefreshCw, 
  ExternalLink, 
  Calculator, 
  BookOpen, 
  Layers, 
  Calendar,
  Sparkles,
  Download
} from 'lucide-react';
import { FilterState } from '../types/marina';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  availableWeeks: string[];
  lastFetched: Date;
  isLive: boolean;
  onRefresh: () => void;
  isLoading: boolean;
  activeTab: 'dashboard' | 'operations' | 'executive' | 'calculator';
  onTabChange: (tab: 'dashboard' | 'operations' | 'executive' | 'calculator') => void;
  onOpenGuide: () => void;
  onExportCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  onFilterChange,
  availableWeeks,
  lastFetched,
  isLive,
  onRefresh,
  isLoading,
  activeTab,
  onTabChange,
  onOpenGuide,
  onExportCSV
}) => {
  return (
    <header id="main-header" className="bg-[#002147] text-white border-b border-[#001733] sticky top-0 z-30 shadow-md">
      {/* Top Banner with Brand and Sync Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00A3E0] flex items-center justify-center shadow-md shadow-[#00A3E0]/20 text-white font-bold tracking-tight">
            <Anchor className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">
              Cancun Lighthouse Marina
            </h1>
            <p className="text-xs text-slate-300 font-normal mt-0.5">
              Operaciones
            </p>
          </div>
        </div>

        {/* Live sync & utility actions */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Sync Status Badge */}
          <div className="flex items-center bg-[#ffffff0f] rounded-lg px-3 py-1.5 border border-white/10 text-slate-200">
            <div className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-medium mr-1.5">{isLive ? 'Google Sheets Conectado' : 'Datos Locales'}</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              ({lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </span>
          </div>

          {/* Refresh Button */}
          <button
            id="btn-refresh-data"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1.5 bg-[#ffffff10] hover:bg-[#ffffff18] text-slate-200 px-3 py-1.5 rounded-lg border border-white/10 transition disabled:opacity-50 cursor-pointer"
            title="Recargar datos desde Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00A3E0]' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          {/* Google Sheets External Link */}
          <a
            id="link-google-sheet"
            href="https://docs.google.com/spreadsheets/d/e/2PACX-1vRHr_YZ4y1-Ww6JKAerEWp1jCp07k3SZkiZcYx47A55PRA7dM-0DLzRMeJgplZbAwLDxswE2sVN9L-U/pubhtml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 bg-[#ffffff10] hover:bg-[#ffffff18] text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 transition"
            title="Abrir hoja de cálculo pública"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ver Sheet</span>
          </a>

          {/* Guide Modal Trigger */}
          <button
            id="btn-open-guide"
            onClick={onOpenGuide}
            className="flex items-center space-x-1.5 bg-[#00A3E0]/20 hover:bg-[#00A3E0]/30 text-[#00A3E0] px-3 py-1.5 rounded-lg border border-[#00A3E0]/40 transition cursor-pointer font-medium"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guía & Fórmulas</span>
          </button>

          {/* Export CSV */}
          <button
            id="btn-export-csv"
            onClick={onExportCSV}
            className="flex items-center space-x-1 bg-[#ffffff10] hover:bg-[#ffffff18] text-slate-200 px-2.5 py-1.5 rounded-lg border border-white/10 transition cursor-pointer"
            title="Descargar datos en CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs and Week Quick Selector Bar */}
      <div className="bg-[#001733] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1.5">
          {/* Main Navigation Views */}
          <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none">
            <button
              id="tab-btn-dashboard"
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#00A3E0] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dashboard Overview</span>
            </button>

            <button
              id="tab-btn-operations"
              onClick={() => onTabChange('operations')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'operations'
                  ? 'bg-[#00A3E0] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Operaciones & Logística</span>
            </button>

            <button
              id="tab-btn-executive"
              onClick={() => onTabChange('executive')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'executive'
                  ? 'bg-[#00A3E0] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reporte Ejecutivo Marina</span>
            </button>

            <button
              id="tab-btn-calculator"
              onClick={() => onTabChange('calculator')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-[#00A3E0] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador PAX & Muelle</span>
            </button>
          </nav>

          {/* Quick Week Filter Selector */}
          <div className="flex items-center space-x-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 whitespace-nowrap mr-1">
              Semana:
            </span>
            <button
              id="filter-week-all"
              onClick={() => onFilterChange('semana', 'ALL')}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                filters.semana === 'ALL'
                  ? 'bg-[#00A3E0] text-white shadow-xs'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              Todas
            </button>
            {availableWeeks.map(w => (
              <button
                key={w}
                id={`filter-week-${w}`}
                onClick={() => onFilterChange('semana', w)}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                  filters.semana === w
                    ? 'bg-[#00A3E0] text-white shadow-xs'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                Sem {w}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
