import React from 'react';
import { 
  RefreshCw, 
  ExternalLink, 
  Calculator, 
  BookOpen, 
  Layers, 
  Calendar,
  Sparkles,
  Download,
  ChevronDown,
  Menu
} from 'lucide-react';
import { FilterState } from '../types/marina';
import { OfficialLogoMark } from './OfficialLogo';

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
  onOpenCertificates: () => void;
  onExportCSV: () => void;
  onOpenMobileDrawer?: () => void;
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
  onOpenCertificates,
  onExportCSV,
  onOpenMobileDrawer
}) => {
  return (
    <header id="main-header" className="bg-gradient-to-r from-[#002147] via-[#052b57] to-[#083a73] dark:from-[#040914] dark:via-[#071326] dark:to-[#0a1b38] text-white border-b border-[#0c3664] dark:border-[#132c4e] sticky top-0 z-30 shadow-lg backdrop-blur-md transition-colors duration-200">
      {/* Top Banner with Brand and Sync Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Identity - Official Logo sends directly to Home / Dashboard */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center space-x-3 group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#00A3E0] rounded-xl p-1 -m-1 transition-all"
            title="Ir a la página de inicio (Dashboard)"
            aria-label="Ir al inicio"
          >
            <div className="w-11 h-11 rounded-xl bg-white text-[#002147] p-1 flex items-center justify-center shadow-md shadow-black/20 transform group-hover:scale-105 transition-all">
              <OfficialLogoMark className="w-9 h-9" color="#002147" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-black tracking-wider text-base sm:text-lg uppercase text-white group-hover:text-sky-200 transition-colors">
                <span>CANCUN</span>
                <span className="text-[#00A3E0]">LIGHTHOUSE</span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.3em] text-sky-200/90 uppercase">
                MARINA
              </p>
            </div>
          </button>

          {/* Mobile Right Quick Action Trigger */}
          <div className="flex md:hidden items-center space-x-1.5">
            <button
              onClick={onOpenMobileDrawer}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 active:scale-95 cursor-pointer transition"
              title="Abrir menú"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live sync & utility actions */}
        <div className="hidden md:flex items-center flex-wrap gap-2 text-xs">
          {/* Sync Status Badge */}
          <div className="flex items-center bg-white/10 dark:bg-sky-950/40 rounded-lg px-3 py-1.5 border border-white/15 dark:border-sky-800/40 text-slate-200">
            <div className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-medium mr-1.5 text-sky-100">{isLive ? 'Google Sheets Conectado' : 'Datos Locales'}</span>
            <span className="text-sky-300/70 text-[11px] hidden lg:inline">
              ({lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </span>
          </div>

          {/* Refresh Button */}
          <button
            id="btn-refresh-data"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 active:scale-95 text-sky-100 px-3 py-1.5 rounded-lg border border-white/15 dark:border-sky-700/40 transition disabled:opacity-50 cursor-pointer"
            title="Recargar datos desde Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00A3E0]' : ''}`} />
            <span>Actualizar</span>
          </button>

          {/* Business Guide Modal Trigger */}
          <button
            id="btn-open-guide"
            onClick={onOpenGuide}
            className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 active:scale-95 text-sky-100 px-2.5 py-1.5 rounded-lg border border-white/15 dark:border-sky-700/40 transition cursor-pointer"
            title="Ver glosario, comisiones 50/50 y guía de cálculo"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#00A3E0]" />
            <span>Guía & Fórmulas</span>
          </button>

          {/* Export CSV */}
          <button
            id="btn-export-csv"
            onClick={onExportCSV}
            className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 active:scale-95 text-sky-100 px-2.5 py-1.5 rounded-lg border border-white/15 dark:border-sky-700/40 transition cursor-pointer"
            title="Descargar datos en CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Exportar</span>
          </button>

          {/* Google Sheets External Link */}
          <a
            id="link-google-sheet"
            href="https://docs.google.com/spreadsheets/d/e/2PACX-1vRHr_YZ4y1-Ww6JKAerEWp1jCp07k3SZkiZcYx47A55PRA7dM-0DLzRMeJgplZbAwLDxswE2sVN9L-U/pubhtml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 active:scale-95 text-sky-100 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/15 dark:border-sky-700/40 transition"
            title="Abrir hoja de cálculo pública"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Sheet</span>
          </a>

          {/* Menu Drawer Button (Desktop & Mobile accessible) */}
          <button
            id="btn-open-menu-drawer"
            onClick={onOpenMobileDrawer}
            className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 active:scale-95 text-sky-100 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/15 dark:border-sky-700/40 transition cursor-pointer"
            title="Abrir Menú de Opciones & Certificados"
          >
            <Menu className="w-3.5 h-3.5 text-[#00A3E0]" />
            <span>Menú</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs and Week Quick Selector Bar */}
      <div className="bg-[#001733] dark:bg-[#030a17] border-t border-[#0c3664] dark:border-[#10243d]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1.5 min-w-0">
          {/* Main Navigation Views */}
          <nav className="flex space-x-1.5 overflow-x-auto py-1 scrollbar-none min-w-0 max-w-full overscroll-x-contain">
            <button
              id="tab-btn-dashboard"
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition active:scale-95 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-[#00A3E0] text-white shadow-md shadow-[#00A3E0]/30'
                  : 'text-sky-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dashboard Overview</span>
            </button>

            <button
              id="tab-btn-operations"
              onClick={() => onTabChange('operations')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition active:scale-95 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === 'operations'
                  ? 'bg-[#00A3E0] text-white shadow-md shadow-[#00A3E0]/30'
                  : 'text-sky-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Operaciones & Logística</span>
            </button>

            <button
              id="tab-btn-executive"
              onClick={() => onTabChange('executive')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition active:scale-95 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === 'executive'
                  ? 'bg-[#00A3E0] text-white shadow-md shadow-[#00A3E0]/30'
                  : 'text-sky-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reporte Ejecutivo Marina</span>
            </button>

            <button
              id="tab-btn-calculator"
              onClick={() => onTabChange('calculator')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition active:scale-95 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === 'calculator'
                  ? 'bg-[#00A3E0] text-white shadow-md shadow-[#00A3E0]/30'
                  : 'text-sky-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador PAX & Muelle</span>
            </button>
          </nav>

          {/* Week Dropdown Selector */}
          <div className="flex items-center space-x-2 flex-shrink-0 self-start sm:self-auto py-1">
            <label htmlFor="header-week-select" className="text-xs font-semibold text-sky-100/90 flex items-center space-x-1.5 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span>Semana ({new Date().getFullYear()}):</span>
            </label>
            <div className="relative">
              <select
                id="header-week-select"
                value={filters.semana}
                onChange={(e) => onFilterChange('semana', e.target.value)}
                className="bg-[#002147] dark:bg-[#071326] hover:bg-[#002b5c] dark:hover:bg-[#0b1e3b] text-white text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg border border-[#00A3E0]/40 dark:border-sky-700/50 focus:outline-none focus:ring-2 focus:ring-[#00A3E0] cursor-pointer appearance-none shadow-xs transition"
              >
                <option value="ALL" className="bg-[#002147] text-white font-normal">
                  Todas las Semanas {new Date().getFullYear()}
                </option>
                {availableWeeks.map(w => (
                  <option key={w} value={w} className="bg-[#002147] text-white font-normal">
                    Semana {w} ({new Date().getFullYear()})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-sky-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
