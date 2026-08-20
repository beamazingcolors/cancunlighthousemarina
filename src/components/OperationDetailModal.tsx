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
import { formatPaxDetail, calculateExpectedMuelle } from '../utils/paxUtils';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#002147] text-white p-5 flex items-center justify-between border-b border-[#001733]">
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
                  Semana {record.semana}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                {record.actividad}: {record.servicio}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Key metadata chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Fecha Operación</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#00A3E0]" />
                {record.diaOperacion}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Locación</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#002147]" />
                {record.locacion}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Promotor</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5 truncate">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                {record.promotor}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Proveedor</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5 truncate">
                <Ship className="w-3.5 h-3.5 text-teal-600" />
                {record.proveedor}
              </span>
            </div>
          </div>

          {/* PAX Analysis Section */}
          <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#002147] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#00A3E0]" />
                Desglose de Pasajeros (PAX): <span className="font-mono bg-white text-[#002147] border border-sky-200 px-1.5 py-0.5 rounded text-xs ml-1 font-bold">{record.paxRaw}</span>
              </span>
              <span className="text-xs font-extrabold text-[#002147] font-mono">
                {record.pax.total} Pasajeros Totales
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="bg-white p-2 rounded-lg border border-sky-200/60 shadow-2xs">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Adultos (1er núm)</span>
                <span className="font-black text-[#002147] text-sm">{record.pax.adults}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-sky-200/60 shadow-2xs">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Niños (1er punto)</span>
                <span className="font-black text-[#00A3E0] text-sm">{record.pax.children}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-sky-200/60 shadow-2xs">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Infantes (2do punto)</span>
                <span className="font-black text-purple-700 text-sm">{record.pax.infants}</span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Estructura Financiera & Utilidades
            </h4>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs shadow-2xs">
              {/* Costos Base */}
              <div className="p-3 bg-slate-50/70 flex justify-between items-center font-semibold text-slate-700">
                <span>Costo Reporte Neto Proveedor</span>
                <span className="font-mono">{formatCurrencySimple(record.costoReporteNeto, record.moneda)}</span>
              </div>

              <div className="p-3 flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1">
                  <span>Over (Margen Ganancia Adicional Empresa)</span>
                </span>
                <span className="font-mono text-emerald-700 font-semibold">
                  +{formatCurrencySimple(record.over, record.moneda)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 flex justify-between items-center font-bold text-slate-900">
                <span>Sub Total con Over</span>
                <span className="font-mono">{formatCurrencySimple(record.subtotalConOver, record.moneda)}</span>
              </div>

              {/* Venta y Moneda */}
              <div className="p-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900">Precio de Venta Cobrado</span>
                  {record.moneda === 'USD' && (
                    <span className="text-[10px] text-slate-500 block">
                      Tipo de cambio aplicado: ${record.tipoCambio} MXN/USD
                    </span>
                  )}
                </div>
                <div className="text-right font-mono">
                  <div className="font-black text-slate-900 text-sm">
                    {formatCurrencySimple(record.venta, record.moneda)}
                  </div>
                  {record.moneda === 'USD' && (
                    <div className="text-[10px] text-slate-500">
                      ≈ {formatCurrencyMXN(record.ventaMXN)}
                    </div>
                  )}
                </div>
              </div>

              {/* Comisión & Reparto */}
              <div className="p-3 bg-slate-50/50 space-y-1.5">
                <div className="flex justify-between items-center text-slate-700 font-medium">
                  <span>Comisión Neta Total (Venta − Subtotal con Over)</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrencySimple(record.comisionNeta, record.moneda)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-white p-2 rounded border border-slate-200 flex justify-between">
                    <span className="text-slate-600">Comisión Vendedor:</span>
                    <span className="font-bold text-amber-700 font-mono">{formatCurrencySimple(record.comision, record.moneda)}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200 flex justify-between">
                    <span className="text-slate-600">Utilidad Casa:</span>
                    <span className="font-bold text-[#002147] font-mono">{formatCurrencySimple(record.casa, record.moneda)}</span>
                  </div>
                </div>
              </div>

              {/* Cobranza: Deposito vs Balance */}
              <div className="p-3 grid grid-cols-3 gap-2 bg-slate-50/90 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Depósito Recibido</span>
                  <span className="font-bold text-emerald-700 font-mono text-xs">
                    {formatCurrencySimple(record.deposito, record.moneda)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Saldo Pendiente (Balance)</span>
                  <span className="font-bold text-amber-700 font-mono text-xs">
                    {formatCurrencySimple(record.balance, record.moneda)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Verificado</span>
                  <span className="font-bold text-slate-900 font-mono text-xs">
                    {formatCurrencySimple(record.total, record.moneda)}
                  </span>
                </div>
              </div>

              {/* Muelle rule audit */}
              <div className="p-3 bg-sky-50/50 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#002147] flex items-center gap-1">
                    <Anchor className="w-3.5 h-3.5 text-[#00A3E0]" />
                    Ingreso por Muellaje
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {record.horas > 0 ? `${record.horas} horas de renta` : 'Sin horas registradas'} 
                    {record.horas >= 4 ? ' → Tarifa $150 MXN/pax (4-8 hrs)' : record.horas >= 1 ? ' → Tarifa $100 MXN/pax (1-3 hrs)' : ''}
                  </span>
                </div>
                <span className="font-bold font-mono text-[#007ba8] text-sm">
                  {formatCurrencyMXN(record.ingresoMuelleMXN)}
                </span>
              </div>

              {/* Utilidad Operativa Final */}
              <div className="p-3.5 bg-[#002147] text-white flex justify-between items-center rounded-b-xl">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
                    Utilidad Operativa Neta
                  </span>
                  <div className="text-[11px] text-[#00A3E0]">
                    Margen Operativo: {formatPercent(record.margenOperativo)}
                  </div>
                </div>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {formatCurrencyMXN(record.utilidadOperativaMXN)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes if present */}
          {record.notas && (
            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-xs">
              <span className="font-bold text-amber-900 block mb-1">Notas / Observaciones:</span>
              <p className="text-amber-800">{record.notas}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#002147] hover:bg-[#001733] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Cerrar Comprobante
          </button>
        </div>
      </div>
    </div>
  );
};
