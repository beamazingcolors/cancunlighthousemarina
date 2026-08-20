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
      example: 'Semana 30',
      rule: 'Permite el análisis comparativo de tendencias semanales.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#002147] text-white p-5 flex items-center justify-between border-b border-[#001733]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00A3E0]/20 border border-[#00A3E0]/40 flex items-center justify-center text-[#00A3E0]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Guía de Llenado & Reglas de Negocio — Reporte de Marina
              </h2>
              <p className="text-xs text-slate-300">
                Definiciones de columnas, cálculos financieros y políticas operativas de Cancun Lighthouse Marina
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Highlight Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-200/80">
              <span className="font-bold text-[#002147] flex items-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-[#00A3E0]" />
                Regla Notación PAX:
              </span>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                El primer número a la izquierda representa <strong>Adultos</strong>. Un punto indica <strong>Niños</strong> y un segundo punto indica <strong>Infantes</strong>. Ej: <code className="bg-white text-[#002147] border border-sky-200 px-1 py-0.5 rounded font-mono font-bold">2.2.1</code> = 2 adultos, 2 niños, 1 infante (Total 5 PAX).
              </p>
            </div>

            <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-200/80">
              <span className="font-bold text-[#002147] flex items-center gap-1.5 mb-1">
                <Anchor className="w-4 h-4 text-[#00A3E0]" />
                Regla de Cobro de Muellaje:
              </span>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                Se cobra por pasajero: Si la actividad dura de <strong>1 a 3 horas</strong> se cobran <strong>$100 MXN</strong> por persona. Si es de <strong>4 a 8 horas</strong> se cobran <strong>$150 MXN</strong> por persona.
              </p>
            </div>
          </div>

          {/* Dictionary Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider">
              Catálogo de Columnas & Impacto Financiero
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {glossaryItems.map((item, idx) => (
                <div key={idx} className="p-3.5 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="sm:w-1/4">
                    <span className="font-bold text-slate-900 text-xs block">{item.field}</span>
                    <span className="text-[10px] font-mono text-[#002147] bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded inline-block mt-0.5 font-semibold">
                      {item.example}
                    </span>
                  </div>
                  <div className="sm:w-3/4 space-y-1">
                    <p className="text-slate-700">{item.what}</p>
                    <p className="text-[11px] text-slate-500 italic">★ {item.rule}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#002147] hover:bg-[#001733] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
