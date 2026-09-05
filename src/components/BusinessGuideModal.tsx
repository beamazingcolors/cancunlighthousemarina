import React from 'react';
import { X, BookOpen, CheckCircle, Info, HelpCircle, Anchor, Users, DollarSign } from 'lucide-react';

interface BusinessGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessGuideModal: React.FC<BusinessGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const glossaryItems = [
    {
      field: 'Actividad',
      what: 'Tipo de operación comercial: Yate, Tour, Marina, Muelle o Pernota.',
      example: 'Yate',
      rule: 'Usar nombres catalogados consistentes.'
    },
    {
      field: 'Servicio',
      what: 'Nombre de la embarcación (ej. Lorenzo, Regina, White Rom) o del tour específico (ej. Buceo, ATV, Capitan Hook, Dolphin Discovery).',
      example: 'Lorenzo',
      rule: 'Facilita la catalogación y control de flota.'
    },
    {
      field: 'PAX (Pasajeros)',
      what: 'Notación jerárquica de pasajeros: 1er número = Adultos, tras 1er punto = Niños, tras 2do punto = Infantes.',
      example: '2.2.1 (2 adultos, 2 niños, 1 infante = 5 PAX)',
      rule: 'Fundamental para el aforo y el cálculo automático de muellaje.'
    },
    {
      field: 'Día & Día de Operación',
      what: 'Día es la fecha de reserva/compra; Día de Operación es cuando se realiza la salida.',
      example: '20-jul-2026',
      rule: 'Permite medir ventana de anticipación de compra.'
    },
    {
      field: 'Proveedor',
      what: 'Persona o empresa que opera la embarcación o provee el servicio turístico.',
      example: 'Oscar Carretero / Cancún Sailing',
      rule: 'Control de pagos a terceros y auditoría.'
    },
    {
      field: 'Costo Reporte Neto',
      what: 'Costo base pactado con el proveedor por la realización de la actividad.',
      example: '$12,000 MXN',
      rule: 'Ligado a la moneda y tipo de cambio correspondiente.'
    },
    {
      field: 'Over',
      what: 'Margen o sobreprecio extra que la empresa retiene para sí misma directamente.',
      example: '$1,000 MXN',
      rule: 'Se suma al costo reporte neto para formar el "Sub total con Over".'
    },
    {
      field: 'Venta',
      what: 'Precio total cobrado al cliente por la actividad.',
      example: '$16,000 MXN',
      rule: 'En la moneda pactada (MXN o USD).'
    },
    {
      field: 'Comisión Neta',
      what: 'Utilidad bruta resultante de restar la Venta menos el Subtotal con Over.',
      example: '$3,000 MXN',
      rule: 'Se divide equitativamente entre el vendedor y la Casa.'
    },
    {
      field: 'Comisión Promotor & Casa',
      what: 'Comisión es la utilidad que recibe el vendedor; Casa es la utilidad retenida por Lighthouse Marina.',
      example: 'Comisión: $1,500 | Casa: $1,500',
      rule: 'Reparto transparente de comisiones de venta.'
    },
    {
      field: 'Depósito & Balance',
      what: 'Depósito es el anticipo cobrado al reservar; Balance es el remanente a cobrar al abordar.',
      example: 'Depósito: $2,000 | Balance: $14,000',
      rule: 'Total = Depósito + Balance = Venta.'
    },
    {
      field: 'Muelle (Muellaje)',
      what: 'Tarifa de uso de muelle por pasajero: $100 MXN si el servicio dura de 1 a 3 hrs; $150 MXN si dura de 4 a 8 hrs.',
      example: '8 PAX en Yate 4 hrs = 8 × $150 = $1,200 MXN',
      rule: 'Ingreso directo adicional para la marina.'
    },
    {
      field: 'Semana',
      what: 'Número de semana del año correspondiente a la fecha de venta/operación.',
      example: `Semana 8 (${new Date().getFullYear()})`,
      rule: 'Permite el análisis comparativo de tendencias semanales.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="bg-[#002147] dark:bg-[#001733] text-white p-5 flex items-center justify-between border-b border-[#001733] dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00A3E0]/20 border border-[#00A3E0]/40 flex items-center justify-center text-[#00A3E0]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Guía Oficial de Llenado, Fórmulas & Glosario
              </h2>
              <p className="text-xs text-slate-300">
                Cancun Lighthouse Marina — Manual Operativo {new Date().getFullYear()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Key Formulas Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#002147] dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Fórmulas Financieras Oficiales
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">1. Subtotal con Over</span>
                <code className="text-[11px] text-cyan-700 dark:text-cyan-300 font-mono block">
                  = Costo Reporte Neto + Over
                </code>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Representa el costo directo real para la empresa.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">2. Comisión Neta Repartible</span>
                <code className="text-[11px] text-cyan-700 dark:text-cyan-300 font-mono block">
                  = Venta − Subtotal con Over
                </code>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Margen bruto antes de dividir entre vendedor y casa.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">3. Comisión Vendedor & Utilidad Casa</span>
                <code className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono block">
                  = Comisión Neta / 2 (50% cada uno)
                </code>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Reparto 50/50 sobre el margen de venta.</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">4. Tarifa de Muellaje</span>
                <code className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono block">
                  = Total PAX × ($100 ó $150 MXN)
                </code>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">$100 (1-3 hrs) | $150 (4-8 hrs) por persona.</p>
              </div>
            </div>
          </div>

          {/* Full Glossary Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#002147] dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#00A3E0]" />
              Glosario de Columnas de la Base de Datos
            </h3>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-left divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-[#002147] dark:bg-[#001733] text-white text-[11px] uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Columna</th>
                    <th className="p-2.5">Definición</th>
                    <th className="p-2.5">Ejemplo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {glossaryItems.map((item) => (
                    <tr key={item.field} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">{item.field}</td>
                      <td className="p-2.5">{item.what}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{item.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#002147] hover:bg-[#002b5c] active:scale-95 text-white text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Entendido, Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
};
