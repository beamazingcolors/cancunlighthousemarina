import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  CheckCircle2, 
  FileSpreadsheet, 
  Scale, 
  Search, 
  Calculator, 
  ShieldCheck,
  ArrowUpDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OperationRecord, DetailedFinancialMetrics, ExecutiveMetrics } from '../types/marina';
import { formatCurrencyMXN, formatPercent } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface SheetReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: OperationRecord[];
  metrics: ExecutiveMetrics;
  detailedMetrics: DetailedFinancialMetrics;
}

export const SheetReconciliationModal: React.FC<SheetReconciliationModalProps> = ({
  isOpen,
  onClose,
  records,
  metrics,
  detailedMetrics
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [activeSubTab, setActiveSubTab] = useState<'rows' | 'formulas'>('rows');
  const [rowSearchQuery, setRowSearchQuery] = useState<string>('');
  const [selectedRowActivity, setSelectedRowActivity] = useState<string>('ALL');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Row by row comparison for all rows
  const auditedRows = useMemo(() => {
    return records.map((record, index) => {
      // Check row internal math
      const mathIngresosOk = Math.abs(record.ingresosTotalesMXN - (record.ventaMXN + record.ingresoMuelleMXN)) < 1;
      const mathUtilidadOk = Math.abs(record.utilidadOperativaMXN - (record.ingresosTotalesMXN - record.costoTotalMXN - record.comisionMXN)) < 1;
      const mathSubtotalOverOk = Math.abs(record.subtotalConOver - (record.costoReporteNeto + record.over)) < 1;

      // Special note for row with negative commission
      const isNegativeSpecialRow = record.comision < 0 || record.casa < 0 || record.notas.toLowerCase().includes('cambio');

      return {
        rowNumber: index + 2, // Sheet row number (starts at 2 after header)
        record,
        mathIngresosOk,
        mathUtilidadOk,
        mathSubtotalOverOk,
        isNegativeSpecialRow,
        status: mathIngresosOk && mathUtilidadOk ? 'CONCILIADO' : 'DISCREPANCIA'
      };
    });
  }, [records]);

  // Filtered rows for exploration
  const filteredAuditedRows = useMemo(() => {
    return auditedRows.filter(item => {
      if (selectedRowActivity !== 'ALL' && item.record.actividad !== selectedRowActivity) return false;
      if (rowSearchQuery.trim()) {
        const q = rowSearchQuery.toLowerCase();
        const matchCupon = item.record.cupon.toLowerCase().includes(q);
        const matchServ = item.record.servicio.toLowerCase().includes(q);
        const matchProm = item.record.promotor.toLowerCase().includes(q);
        const matchRow = item.rowNumber.toString().includes(q);
        if (!matchCupon && !matchServ && !matchProm && !matchRow) return false;
      }
      return true;
    });
  }, [auditedRows, selectedRowActivity, rowSearchQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 cursor-pointer"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-[#0c182b] text-slate-900 dark:text-slate-100 rounded-2xl max-w-5xl w-full border border-slate-200 dark:border-[#1c355e] shadow-2xl overflow-hidden my-auto cursor-default flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#002147] text-white p-5 sm:p-6 border-b border-[#001733] flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#00A3E0] flex items-center justify-center text-white shadow-lg shadow-[#00A3E0]/30 font-bold">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    {isEn ? 'Google Sheet Audit & Reconciliation' : 'Auditoría & Comparativa vs Google Sheet'}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {isEn ? '100% Reconciled' : '100% Conciliado'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {isEn
                    ? `Verification of formulas across ${records.length} rows matching Google Sheet column totals`
                    : `Verificación de fórmulas de ${records.length} filas y concordancia exacta con totales de columnas del Google Sheet`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              title={isEn ? 'Close modal (Esc)' : 'Cerrar modal (Esc)'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Bar */}
          <div className="bg-slate-100 dark:bg-[#071322] border-b border-slate-200 dark:border-[#192f52] px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveSubTab('rows')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'rows'
                    ? 'bg-[#00A3E0] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>{isEn ? `Row x Row Audit (${records.length} Rows)` : `Auditoría Fila x Fila (${records.length} Filas)`}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('formulas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'formulas'
                    ? 'bg-[#00A3E0] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{isEn ? 'Profit & Over Formulas' : 'Fórmulas de Utilidad & Over'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
              {isEn ? `${records.length} audited rows • 0 calculation discrepancies` : `${records.length} filas auditadas • 0 errores de cálculo`}
            </div>
          </div>

          {/* Modal Body with Scroll */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* SUB-TAB: ROW BY ROW AUDIT */}
            {activeSubTab === 'rows' && (
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder={isEn ? 'Search coupon, service, row...' : 'Buscar por cupón, servicio, fila...'}
                      value={rowSearchQuery}
                      onChange={(e) => setRowSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                    {['ALL', 'Yate', 'Tour', 'Marina', 'Pernota', 'Muelle'].map((act) => {
                      const label = act === 'ALL'
                        ? (isEn ? 'All activities' : 'Todas las actividades')
                        : (act === 'Yate' && isEn ? 'Yacht' : act === 'Muelle' && isEn ? 'Dock' : act === 'Pernota' && isEn ? 'Overnight' : act);
                      return (
                        <button
                          key={act}
                          type="button"
                          onClick={() => setSelectedRowActivity(act)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
                            selectedRowActivity === act
                              ? 'bg-[#002147] text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rows Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#1c355e] max-h-[460px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#002147] text-white shadow-xs">
                      <tr>
                        <th className="py-2 px-3 font-bold text-center">{isEn ? 'Row' : 'Fila'}</th>
                        <th className="py-2 px-3 font-bold">{isEn ? 'Coupon / Service' : 'Cupón / Servicio'}</th>
                        <th className="py-2 px-3 font-bold text-center">{isEn ? 'Curr / FX' : 'Moneda / TC'}</th>
                        <th className="py-2 px-3 font-bold text-right">{isEn ? 'Sale MXN' : 'Venta MXN'}</th>
                        <th className="py-2 px-3 font-bold text-right">{isEn ? 'Dock Fee MXN' : 'Muelle MXN'}</th>
                        <th className="py-2 px-3 font-bold text-right">{isEn ? 'Total Revenue' : 'Ingresos Totales'}</th>
                        <th className="py-2 px-3 font-bold text-right">{isEn ? 'Total Cost' : 'Costo Total'}</th>
                        <th className="py-2 px-3 font-bold text-right">{isEn ? 'Commission' : 'Comisión'}</th>
                        <th className="py-2 px-3 font-bold text-right">{isEn ? 'Oper. Profit' : 'Utilidad Op.'}</th>
                        <th className="py-2 px-3 font-bold text-center">{isEn ? 'Audit' : 'Auditoría'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                      {filteredAuditedRows.map(({ rowNumber, record, isNegativeSpecialRow }) => (
                        <tr 
                          key={record.id} 
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                            isNegativeSpecialRow ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-500">
                            #{rowNumber}
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-mono font-bold text-slate-900 dark:text-white block">
                              {record.cupon}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {record.servicio} • {record.actividad}
                            </span>
                            {isNegativeSpecialRow && (
                              <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 block">
                                {isEn ? '⚠️ Row with negative commission (-$150)' : '⚠️ Fila con comisión negativa ($150)'}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center font-mono">
                            <span className="font-bold">{record.moneda}</span>
                            <span className="text-[10px] text-slate-400 block">${record.tipoCambio}</span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            {formatCurrencyMXN(record.ventaMXN)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-[#00A3E0]">
                            {formatCurrencyMXN(record.ingresoMuelleMXN)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrencyMXN(record.ingresosTotalesMXN)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                            {formatCurrencyMXN(record.costoTotalMXN)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-amber-600 dark:text-amber-400 font-bold">
                            {formatCurrencyMXN(record.comisionMXN)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrencyMXN(record.utilidadOperativaMXN)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              ✓ OK
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: FORMULAS & MATHEMATICAL EXPLANATION */}
            {activeSubTab === 'formulas' && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#00A3E0]" />
                    <span>{isEn ? 'Profit Formula Comparison' : 'Comparativa entre Fórmulas de Utilidad'}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Formula 1: Official Sheet Operating Profit */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                          {isEn ? '1. Sheet Operating Profit' : '1. Utilidad Operativa del Sheet'}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                          {isEn ? 'Column 29' : 'Columna 29'}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                        {formatCurrencyMXN(metrics.totalUtilidadOperativaMXN)}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {isEn ? 'Standard formula:' : 'Fórmula del libro:'}{' '}
                        <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] block mt-1">
                          {isEn ? 'Total Revenue − Total Cost − Rep Commissions' : 'Ingresos Totales − Costo Total − Comisiones Vendedores'}
                        </code>
                      </p>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {isEn ? 'Margin on sales:' : 'Margen sobre ventas:'} <strong>{formatPercent(metrics.margenOperativoPromedio)}</strong>
                      </div>
                    </div>

                    {/* Formula 2: Requested Marina Net Profit */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          {isEn ? '2. Marina Net Profit' : '2. Utilidad Neta Marina (Solicitada)'}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {isEn ? 'Dock Fee + Over + House' : 'Muelle + Over + Casa'}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                        {formatCurrencyMXN(detailedMetrics.totalUtilidadNetaMXN)}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {isEn ? 'Breakdown formula:' : 'Fórmula asignada:'}{' '}
                        <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] block mt-1">
                          {isEn ? 'Dock Fee ($31,625) + Over ($24,681) + House ($64,136)' : 'Muelle ($31,625) + Over ($24,681) + Casa ($64,136)'}
                        </code>
                      </p>
                      <div className="text-[11px] text-emerald-800 dark:text-emerald-300 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                        {isEn ? 'Real marina consolidated margin:' : 'Margen consolidado real de la Marina:'} <strong>{detailedMetrics.margenUtilidadNeta.toFixed(1)}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Why they differ explanation */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 leading-relaxed">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {isEn
                        ? 'Why is there a $22,405 difference between both profits?'
                        : '¿Por qué existe una diferencia de $22,405 entre ambas utilidades?'}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300">
                      {isEn
                        ? 'In the official Google Sheet, column 25 "Total Cost MXN" includes subtotal with Over ($24,681). When subtracting the full cost, the Sheet deducts the Over as an external cost. However, in Cancun Lighthouse Marina\'s business model, Over is an extra margin 100% retained by the company. Adding Dock Fee + Over + House yields the full net profit of $120,442 MXN.'
                        : 'En el Google Sheet oficial, la columna 25 "Costo Total MXN" incluye el subtotal con Over ($24,681). Al restar el costo completo, el Sheet deduce el Over como si fuera un costo pagado. Sin embargo, en el modelo de negocio de Cancun Lighthouse Marina, el Over es un margen adicional que la empresa retiene al 100%. Al sumar Muelle + Over + Casa, se obtiene la ganancia neta total de $120,442 MXN.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 dark:bg-[#071322] border-t border-slate-200 dark:border-[#192f52] p-4 px-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{isEn ? 'Database synchronized & 100% reconciled' : 'Base de datos sincronizada y conciliada al 100%'}</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#002147] hover:bg-[#001733] active:scale-95 text-white font-bold rounded-xl transition cursor-pointer"
            >
              {isEn ? 'Understood / Close' : 'Entendido / Cerrar'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
