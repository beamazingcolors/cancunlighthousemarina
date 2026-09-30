import React from 'react';
import { 
  X, 
  RefreshCw, 
  Download, 
  BookOpen, 
  ShieldCheck, 
  ExternalLink,
  Calendar,
  Sparkles,
  Layers,
  Calculator,
  Globe,
  LogOut,
  Crown,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FilterState } from '../types/marina';
import { OfficialLogoMark } from './OfficialLogo';
import { useLanguage } from '../context/LanguageContext';
import { UserAccount } from '../utils/security';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  availableWeeks: string[];
  onRefresh: () => void;
  isLoading: boolean;
  onExportCSV: () => void;
  onOpenGuide: () => void;
  onOpenCertificates: () => void;
  isLive: boolean;
  lastFetched: Date;
  onOpenCalendar?: (mode?: 'days' | 'weeks') => void;
  currentUser?: UserAccount | null;
  onLogoutClick?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  availableWeeks,
  onRefresh,
  isLoading,
  onExportCSV,
  onOpenGuide,
  onOpenCertificates,
  isLive,
  lastFetched,
  onOpenCalendar,
  currentUser,
  onLogoutClick
}) => {
  const { language, setLanguage, t, l } = useLanguage();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-xs flex justify-end">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-10 w-full max-w-xs sm:max-w-sm h-full bg-[#001733] text-white border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-y-auto"
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center text-[#002147] shadow">
                <OfficialLogoMark className="w-7 h-7" color="#002147" />
              </div>
              <div>
                <div className="flex items-center gap-1 font-bold text-xs uppercase text-white">
                  <span>CANCUN</span>
                  <span className="text-[#00A3E0]">LIGHTHOUSE</span>
                </div>
                <p className="text-[9px] font-semibold tracking-widest text-sky-200">{t.brandMarina}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body Items */}
          <div className="p-4 space-y-4 flex-1">
            {/* Language Selector in Drawer */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/10">
              <label className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#00A3E0]" />
                <span>{l('Idioma del Sistema', 'System Language')}</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    language === 'es'
                      ? 'bg-[#00A3E0] text-white shadow-sm ring-1 ring-white/30'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>🇲🇽</span>
                  <span>Español</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    language === 'en'
                      ? 'bg-[#00A3E0] text-white shadow-sm ring-1 ring-white/30'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>🇺🇸</span>
                  <span>English</span>
                </button>
              </div>
            </div>

            {/* Location context card */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                {l('Punto de Venta Oficial', 'Official Sales Point')}
              </span>
              <p className="text-white font-semibold text-xs mt-0.5">
                Plaza La Isla Cancún, Quintana Roo
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {l('Módulo de ventas de tours náuticos y servicios', 'Sales booth for nautical tours and private charters')}
              </p>
            </div>

            {/* Week Quick Selector Dropdown */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-sky-300 uppercase tracking-wider block flex items-center gap-1.5 pt-1">
                <Calendar className="w-3.5 h-3.5 text-[#00A3E0]" />
                <span>{t.filterByWeek}</span>
              </label>
              <select
                id="drawer-week-select"
                value={filters.semana}
                onChange={(e) => {
                  onFilterChange('semana', e.target.value);
                  onClose();
                }}
                className="w-full bg-[#002147] text-white text-xs font-semibold py-2 px-3 rounded-xl border border-[#00A3E0]/40 focus:ring-2 focus:ring-[#00A3E0] cursor-pointer"
              >
                <option value="ALL">{t.allWeeks}</option>
                {availableWeeks.map(w => (
                  <option key={w} value={w}>
                    {t.week} {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Active User Card & Logout in Drawer */}
            {currentUser && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">
                    {l('Usuario Conectado', 'Connected User')}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    currentUser.role === 'superadmin'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30'
                  }`}>
                    {currentUser.role === 'superadmin' ? '★ SUPER ADMIN' : 'USUARIO'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#00A3E0]">
                    {currentUser.role === 'superadmin' ? <Crown className="w-4 h-4 text-amber-400" /> : <UserCheck className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                  </div>
                </div>

                {onLogoutClick && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogoutClick();
                    }}
                    className="w-full mt-1 py-2 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{l('Cerrar Sesión', 'Sign Out')}</span>
                  </button>
                )}
              </div>
            )}

            {/* Quick Actions List */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {l('Acciones Rápidas', 'Quick Actions')}
              </span>

              {/* Refresh */}
              <button
                onClick={() => {
                  onRefresh();
                  onClose();
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center space-x-2.5">
                  <RefreshCw className={`w-4 h-4 text-[#00A3E0] ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{l('Sincronizar Datos', 'Sync Data')}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isLive ? 'Online' : 'Local'}
                </span>
              </button>

              {/* Export CSV */}
              <button
                onClick={() => {
                  onExportCSV();
                  onClose();
                }}
                className="w-full flex items-center space-x-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{l('Exportar Reporte en CSV', 'Export CSV Report')}</span>
              </button>

              {/* Guide */}
              <button
                onClick={() => {
                  onOpenGuide();
                  onClose();
                }}
                className="w-full flex items-center space-x-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>{t.guideAndFormulas}</span>
              </button>

              {/* Certificates */}
              <button
                onClick={() => {
                  onOpenCertificates();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{l('Seguridad & Cumplimiento Marítimo Oficial', 'Safety & Maritime Compliance')}</span>
                </div>
                <span className="text-[10px] text-emerald-400/80 font-mono">
                  SCT • SSL
                </span>
              </button>
            </div>

            {/* External Google Sheet */}
            <div className="pt-2">
              <a
                href="https://docs.google.com/spreadsheets/d/e/2PACX-1vRHr_YZ4y1-Ww6JKAerEWp1jCp07k3SZkiZcYx47A55PRA7dM-0DLzRMeJgplZbAwLDxswE2sVN9L-U/pubhtml"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#00A3E0]/15 hover:bg-[#00A3E0]/25 border border-[#00A3E0]/30 text-xs font-semibold text-[#00A3E0] transition"
              >
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>{l('Abrir Google Sheet Público', 'Open Public Google Sheet')}</span>
                </div>
                <span className="text-[10px]">↗</span>
              </a>
            </div>
          </div>

          {/* Drawer Footer info */}
          <div className="p-4 bg-[#001026] border-t border-white/10 text-center text-[10px] text-slate-400">
            <span>Cancun Lighthouse Marina • {l('Sistema Operativo', 'Operating System')} {new Date().getFullYear()}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
