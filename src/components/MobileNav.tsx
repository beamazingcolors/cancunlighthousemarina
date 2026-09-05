import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Calendar, 
  Calculator, 
  Menu
} from 'lucide-react';
import { motion } from 'motion/react';

interface MobileNavProps {
  activeTab: 'dashboard' | 'operations' | 'executive' | 'calculator';
  onTabChange: (tab: 'dashboard' | 'operations' | 'executive' | 'calculator') => void;
  onOpenDrawer: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  onOpenDrawer
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
    { id: 'operations', label: 'Operaciones', icon: Layers },
    { id: 'executive', label: 'Reporte', icon: Calendar },
    { id: 'calculator', label: 'Calculadora', icon: Calculator },
  ] as const;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#001733]/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-white/10 dark:border-slate-800 px-2 py-1.5 pb-safe shadow-2xl">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-[#00A3E0] font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-mobile-indicator"
                  className="absolute -top-1.5 w-8 h-1 bg-[#00A3E0] rounded-full shadow-sm shadow-[#00A3E0]"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Menu / Drawer Toggle */}
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          title="Menú y Ajustes"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Menú</span>
        </button>
      </nav>
    </div>
  );
};
