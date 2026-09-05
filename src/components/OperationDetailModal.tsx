import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Ship, 
  User, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  Anchor, 
  Users,
  Percent,
  Receipt
} from 'lucide-react';
import { OperationRecord } from '../types/marina';
import { formatCurrencyMXN, formatCurrencySimple, formatPercent } from '../utils/formatters';
import { calculateExpectedMuelle } from '../utils/paxUtils';

interface OperationDetailModalProps {
  record: OperationRecord | null;
  onClose: () => void;
}

export const OperationDetailModal: React.FC<OperationDetailModalProps> = ({
  record,
  onClose
}) => {
  if (!record) return null;

  const expectedMuelle = calculateExpectedMuelle(record.pax.total, record.horas);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="bg-[#002147] dark:bg-[#001733] text-white p-5 flex items-center justify-between border-b border-[#001733] dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00A3E0]/20 border border-[#00A3E0]/40 flex items-center justify-center text-[#00A3E0]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono bg-[#001733] text-sky-200 border border-[#00A3E0]/30 px-2 py-0.5 rounded font-bold">
                  {record.cupon || `FOLIO-${record.rowIndex}`}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  record.estatusCobro === 'Liquidado'
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                    : 'bg-amber-900/60 text-amber-300 border border-amber-700'
                }`}>
                  {record.estatusCobro}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Semana {record.semana} ({new Date().getFullYear()})
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                {record.actividad}: {record.servicio}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Key metadata chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Fecha Operación</span>
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#00A3E0]" />
                {record.diaOperacion}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Locación</span>
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#002147] dark:text-sky-300" />
                {record.locacion}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Promotor</span>
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5 truncate">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                {record.promotor}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Proveedor</span>
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5 truncate">
                <Ship className="w-3.5 h-3.5 text-cyan-400" />
                {record.proveedor || 'Propio'}
              </span>
            </div>
          </div>

          {/* PAX & Muelle Breakdown Card */}
          <div className="p-4 bg-sky-50/70 dark:bg-slate-800/80 rounded-xl border border-sky-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#002147] dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#002147] dark:text-sky-300" />
                Desglose PAX & Tarifa de Muellaje
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                Código: {record.paxRaw || record.pax.total}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Adultos</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{record.pax.adults}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Niños / Menores</span>
                <span className="font-bold text-sm text-[#00A3E0]">{record.pax.children}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Infantes</span>
                <span className="font-bold text-sm text-purple-600 dark:text-purple-400">{record.pax.infants}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between pt-1 border-t border-sky-200/60 dark:border-slate-700">
              <span>Muellaje Cobrado ({record.horas} hrs de renta):</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                +{formatCurrencyMXN(record.muelle)}
              </span>
            </div>
          </div>

          {/* Financial Math Breakdown Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Desglose Financiero & Reparto de Utilidad
            </h3>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700 text-xs">
              <div className="p-3 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Precio Venta Registrado:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrencySimple(record.venta, record.moneda)}
                </span>
              </div>

              <div className="p-3 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Ingresos Totales (Venta + Muelle):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrencyMXN(record.ingresosTotalesMXN)}
                </span>
              </div>

              <div className="p-3 flex justify-between text-rose-700 dark:text-rose-400">
                <span>Costo Proveedor Neto:</span>
                <span className="font-mono font-bold">
                  {formatCurrencySimple(record.costoReporteNeto, record.moneda)}
                </span>
              </div>

              <div className="p-3 flex justify-between text-slate-700 dark:text-slate-300">
                <span>Over Empresa:</span>
                <span className="font-mono font-bold">
                  {formatCurrencySimple(record.over, record.moneda)}
                </span>
              </div>

              <div className="p-3 flex justify-between bg-slate-100 dark:bg-slate-800/90 font-semibold">
                <span className="text-slate-800 dark:text-slate-200">Subtotal con Over (Costo Real):</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {formatCurrencySimple(record.subtotalConOver, record.moneda)}
                </span>
              </div>

              <div className="p-3 flex justify-between text-amber-700 dark:text-amber-400">
                <span>Comisión Promotor / Vendedor:</span>
                <span className="font-mono font-bold">
                  {formatCurrencySimple(record.comision, record.moneda)}
                </span>
              </div>

              <div className="p-3 flex justify-between text-[#002147] dark:text-sky-300 font-bold">
                <span>Utilidad Casa (50% margen):</span>
                <span className="font-mono">
                  {formatCurrencySimple(record.casa, record.moneda)}
                </span>
              </div>

              <div className="p-3.5 flex justify-between items-center bg-[#002147] text-white rounded-b-xl">
                <div>
                  <span className="text-[10px] uppercase tracking-wider block text-slate-300">Utilidad Operativa Total</span>
                  <span className="font-bold text-emerald-400 text-sm">Margen: {formatPercent(record.margenOperativo)}</span>
                </div>
                <span className="font-mono font-black text-lg text-emerald-300">
                  {formatCurrencyMXN(record.utilidadOperativaMXN)}
                </span>
              </div>
            </div>
          </div>

          {/* Collection Status */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Estado de Cobranza & Depósitos
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Depósito Recibido</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{formatCurrencySimple(record.deposito, record.moneda)}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Balance Pendiente</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{formatCurrencySimple(record.balance, record.moneda)}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Total Liquidado</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrencySimple(record.total, record.moneda)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {record.notas && (
            <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs">
              <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">Notas de Bitácora / Operación:</span>
              <p className="text-amber-800 dark:text-amber-200">{record.notas}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#002147] hover:bg-[#002b5c] active:scale-95 text-white text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
