import React from 'react';
import { 
  RefreshCw, 
  ExternalLink, 
  BookOpen, 
  Layers, 
  Calendar,
  Sparkles,
  Download,
  ChevronDown,
  Menu,
  FileSpreadsheet,
  Globe,
  LogOut,
  Crown,
  UserCheck
} from 'lucide-react';
import { FilterState } from '../types/marina';
import { OfficialLogoMark } from './OfficialLogo';
import { useLanguage } from '../context/LanguageContext';
import { UserAccount } from '../utils/security';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  availableWeeks: string[];
  lastFetched: Date;
  isLive: boolean;
  onRefresh: () => void;
  isLoading: boolean;
  activeTab: 'dashboard' | 'operations' | 'executive' | 'calendar';
  onTabChange: (tab: 'dashboard' | 'operations' | 'executive' | 'calendar') => void;
  onOpenGuide: () => void;
  onOpenCertificates: () => void;
  onExportCSV: () => void;
  onOpenMobileDrawer?: () => void;
  onOpenReconciliation?: () => void;
  onOpenCalendarModal?: (mode?: 'days' | 'weeks') => void;
  currentUser?: UserAccount | null;
  onLogoutClick?: () => void;
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
  onExportCSV,
  onOpenMobileDrawer,
  onOpenReconciliation,
  currentUser,
  onLogoutClick
}) => {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  return (
    <header id="main-header" className="bg-gradient-to-r from-[#002147] via-[#052b57] to-[#083a73] dark:from-[#040914] dark:via-[#071326] dark:to-[#0a1b38] text-white border-b border-[#0c3664] dark:border-[#132c4e] sticky top-0 z-30 shadow-lg backdrop-blur-md transition-colors duration-200">
      {/* Top Banner with Brand and Sync Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Identity - Official Logo sends directly to Home / Dashboard */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center space-x-3 group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#00A3E0] rounded-xl p-1 -m-1 transition-all"
            title="Dashboard Overview"
            aria-label="Dashboard Overview"
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
                {t.brandMarina}
              </p>
            </div>
          </button>

          {/* Mobile Right Quick Action Trigger & Language Switcher */}
          <div className="flex md:hidden items-center space-x-1.5">
            <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/20">
              <button
                type="button"
                onClick={() => setLanguage('es')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  language === 'es'
                    ? 'bg-[#00A3E0] text-white shadow-xs'
                    : 'text-sky-200/80 hover:text-white'
                }`}
                title="Español"
              >
                <span>🇲🇽 ES</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#00A3E0] text-white shadow-xs'
                    : 'text-sky-200/80 hover:text-white'
                }`}
                title="English"
              >
                <span>🇺🇸 EN</span>
              </button>
            </div>
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
            <span className="font-medium mr-1.5 text-sky-100">{isLive ? t.sheetsConnected : t.localData}</span>
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
            title={language === 'es' ? "Recargar datos desde Google Sheets" : "Reload data from Google Sheets"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00A3E0]' : ''}`} />
            <span>{t.refresh}</span>
          </button>

          {/* Business Guide Modal Trigger */}
          <button
            id="btn-open-guide"
            onClick={onOpenGuide}
            className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 active:scale-95 text-sky-100 px-2.5 py-1.5 rounded-lg border border-white/15 dark:border-sky-700/40 transition cursor-pointer"
            title={t.guideAndFormulas}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#00A3E0]" />
            <span>{t.guideAndFormulas}</span>
          </button>

          {/* Google Sheet Reconciliation Trigger */}
          {onOpenReconciliation && (
            <button
              id="btn-open-reconciliation"
              onClick={onOpenReconciliation}
              className="flex items-center space-x-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 px-2.5 py-1.5 rounded-lg border border-emerald-400/40 transition cursor-pointer"
              title={t.sheetAudit}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.sheetAudit}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950">100%</span>
            </button>
          )}

          {/* Export CSV */}
          <button
            id="btn-export-csv"
            onClick={onExportCSV}
            className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 active:scale-95 text-sky-100 px-2.5 py-1.5 rounded-lg border border-white/15 dark:border-sky-700/40 transition cursor-pointer"
            title={language === 'es' ? "Descargar datos en CSV" : "Download data in CSV"}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.exportCsv}</span>
          </button>

          {/* Google Sheets External Link */}
          <a
            id="link-google-sheet"
            href="https://docs.google.com/spreadsheets/d/e/2PACX-1vRHr_YZ4y1-Ww6JKAerEWp1jCp07k3SZkiZcYx47A55PRA7dM-0DLzRMeJgplZbAwLDxswE2sVN9L-U/pubhtml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 active:scale-95 text-sky-100 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/15 dark:border-sky-700/40 transition"
            title={language === 'es' ? "Abrir hoja de cálculo pública" : "Open public Google Sheet"}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Sheet</span>
          </a>

          {/* Language Switcher Dual Segmented Button (Desktop) */}
          <div className="flex items-center bg-white/10 dark:bg-sky-950/50 p-0.5 rounded-xl border border-white/20 dark:border-sky-700/50 shadow-xs">
            <button
              id="btn-lang-es"
              type="button"
              onClick={() => setLanguage('es')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                language === 'es'
                  ? 'bg-gradient-to-r from-sky-500 to-[#00A3E0] text-white shadow-sm ring-1 ring-white/20'
                  : 'text-sky-200 hover:text-white hover:bg-white/5'
              }`}
              title="Español (México)"
            >
              <span>🇲🇽</span>
              <span>ES</span>
            </button>
            <button
              id="btn-lang-en"
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                language === 'en'
                  ? 'bg-gradient-to-r from-sky-500 to-[#00A3E0] text-white shadow-sm ring-1 ring-white/20'
                  : 'text-sky-200 hover:text-white hover:bg-white/5'
              }`}
              title="English (US)"
            >
              <span>🇺🇸</span>
              <span>EN</span>
            </button>
          </div>

          {/* Active User Badge & Logout Trigger */}
          {currentUser && (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/20">
              <div 
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white/10 dark:bg-sky-950/40 border border-white/15 text-xs text-slate-100"
                title={`${currentUser.name} (${currentUser.email})`}
              >
                {currentUser.role === 'superadmin' ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                )}
                <span className="font-semibold text-[11px] max-w-[120px] truncate">
                  {currentUser.name}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                  currentUser.role === 'superadmin' 
                    ? 'bg-amber-400/25 text-amber-300 border border-amber-400/40' 
                    : 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30'
                }`}>
                  {currentUser.role === 'superadmin' ? 'SUPER' : 'USER'}
                </span>
              </div>

              {onLogoutClick && (
                <button
                  id="btn-header-logout"
                  type="button"
                  onClick={onLogoutClick}
                  className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 text-rose-300 hover:text-white border border-rose-500/40 transition cursor-pointer flex items-center gap-1 text-xs"
                  title={language === 'en' ? 'Sign out' : 'Cerrar sesión'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline text-[11px] font-semibold">
                    {language === 'en' ? 'Exit' : 'Salir'}
                  </span>
                </button>
              )}
            </div>
          )}
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
              <span>{t.tabDashboard}</span>
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
              <span>{t.tabOperations}</span>
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
              <span>{t.tabExecutive}</span>
            </button>

            <button
              id="tab-btn-calendar"
              onClick={() => onTabChange('calendar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition active:scale-95 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === 'calendar'
                  ? 'bg-[#00A3E0] text-white shadow-md shadow-[#00A3E0]/30'
                  : 'text-sky-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.tabCalendar}</span>
            </button>
          </nav>

          {/* Week Selector Dropdown: Seleccionar semana y arrojar toda la información en el sitio */}
          <div className="flex items-center space-x-2 flex-shrink-0 self-start sm:self-auto py-1">
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-sky-300">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <select
                id="header-week-select"
                value={filters.semana}
                onChange={(e) => onFilterChange('semana', e.target.value)}
                className="bg-white/10 hover:bg-white/15 dark:bg-sky-950/60 border border-white/20 dark:border-sky-700/50 text-white text-xs font-semibold rounded-xl pl-8 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00A3E0] cursor-pointer appearance-none transition shadow-sm"
                title={t.filterByWeek}
              >
                <option value="ALL" className="bg-[#002147] text-white py-1">
                  {t.allWeeks}
                </option>
                {availableWeeks.map((week) => (
                  <option key={week} value={week} className="bg-[#002147] text-white py-1">
                    {t.week} {week}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-sky-300">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
