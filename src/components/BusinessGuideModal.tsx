import React, { useEffect } from 'react';
import { X, BookOpen, CheckCircle, Info, HelpCircle, Anchor, Users, DollarSign } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BusinessGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessGuideModal: React.FC<BusinessGuideModalProps> = ({ isOpen, onClose }) => {
  const { language, l } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const glossaryItems = [
    {
      field: l('Actividad', 'Activity'),
      what: l('Tipo de operación comercial: Yate, Tour, Marina, Muelle o Pernota.', 'Type of commercial activity: Yacht, Tour, Marina, Dock or Overnight.'),
      example: l('Yate', 'Yacht'),
      rule: l('Usar nombres catalogados consistentes.', 'Use standardized, consistent categories.')
    },
    {
      field: l('Servicio', 'Service'),
      what: l('Nombre de la embarcación (ej. Lorenzo, Regina, White Rom) o del tour específico (ej. Buceo, ATV, Capitan Hook, Dolphin Discovery).', 'Vessel name (e.g. Lorenzo, Regina, White Rom) or specific tour (e.g. Diving, ATV, Captain Hook, Dolphin Discovery).'),
      example: 'Lorenzo',
      rule: l('Facilita la catalogación y control de flota.', 'Facilitates fleet control and auditing.')
    },
    {
      field: l('PAX (Pasajeros)', 'PAX (Passengers)'),
      what: l('Notación jerárquica de pasajeros: 1er número = Adultos, tras 1er punto = Niños, tras 2do punto = Infantes.', 'Hierarchical passenger notation: 1st number = Adults, after 1st dot = Children, after 2nd dot = Infants.'),
      example: '2.2.1 (2 ad, 2 ch, 1 inf = 5 PAX)',
      rule: l('Fundamental para el aforo y el cálculo automático de muellaje.', 'Critical for vessel capacity and dockage calculation.')
    },
    {
      field: l('Día & Día de Operación', 'Booking Date & Trip Date'),
      what: l('Día es la fecha de reserva/compra; Día de Operación es cuando se realiza la salida.', 'Booking Date is purchase date; Trip Date is when the tour takes place.'),
      example: '20-jul-2026',
      rule: l('Permite medir ventana de anticipación de compra.', 'Measures lead time between purchase and service.')
    },
    {
      field: l('Proveedor', 'Vendor / Operator'),
      what: l('Persona o empresa que opera la embarcación o provee el servicio turístico.', 'Person or company operating the vessel or providing the tour service.'),
      example: 'Oscar Carretero / Cancún Sailing',
      rule: l('Control de pagos a terceros y auditoría.', 'Third-party payment auditing and verification.')
    },
    {
      field: l('Costo Reporte Neto', 'Net Reported Cost'),
      what: l('Costo base pactado con el proveedor por la realización de la actividad.', 'Base cost agreed with vendor for performing the activity.'),
      example: '$12,000 MXN',
      rule: l('Ligado a la moneda y tipo de cambio correspondiente.', 'Linked to the respective currency and FX rate.')
    },
    {
      field: l('Over', 'Over (Markup)'),
      what: l('Margen o sobreprecio extra que la empresa retiene para sí misma directamente.', 'Extra retained margin retained directly by the company.'),
      example: '$1,000 MXN',
      rule: l('Se suma al costo reporte neto para formar el "Sub total con Over".', 'Added to net cost to form "Subtotal with Over".')
    },
    {
      field: l('Venta', 'Sale Price'),
      what: l('Precio total cobrado al cliente por la actividad.', 'Total price charged to the client for the tour.'),
      example: '$16,000 MXN',
      rule: l('En la moneda pactada (MXN o USD).', 'In the agreed currency (MXN or USD).')
    },
    {
      field: l('Comisión Neta', 'Net Commission'),
      what: l('Utilidad bruta resultante de restar la Venta menos el Subtotal con Over.', 'Gross margin obtained by subtracting Subtotal with Over from Sale Price.'),
      example: '$3,000 MXN',
      rule: l('Se divide equitativamente entre el vendedor y la Casa.', 'Split equally 50/50 between promoter and House.')
    },
    {
      field: l('Comisión Promotor & Casa', 'Promoter & House Commission'),
      what: l('Comisión es la utilidad que recibe el vendedor; Casa es la utilidad retenida por Lighthouse Marina.', 'Commission is payout for salesperson; House is retained Marina gain.'),
      example: 'Comisión: $1,500 | Casa: $1,500',
      rule: l('Reparto transparente de comisiones de venta.', 'Transparent 50/50 sales commission distribution.')
    },
    {
      field: l('Depósito & Balance', 'Deposit & Balance'),
      what: l('Depósito es el anticipo cobrado al reservar; Balance es el remanente a cobrar al abordar.', 'Deposit is prepayment on booking; Balance is remainder collected upon boarding.'),
      example: 'Depósito: $2,000 | Balance: $14,000',
      rule: 'Total = Depósito + Balance = Venta.'
    },
    {
      field: l('Muelle (Muellaje)', 'Dockage (Muelle)'),
      what: l('Tarifa de uso de muelle por pasajero: $100 MXN si el servicio dura de 1 a 3 hrs; $150 MXN si dura de 4 a 8 hrs.', 'Dock fee per passenger: $100 MXN for 1-3 hrs; $150 MXN for 4-8 hrs.'),
      example: '8 PAX × $150 = $1,200 MXN',
      rule: l('Ingreso directo adicional para la marina.', 'Direct additional dock revenue for the marina.')
    },
    {
      field: l('Semana', 'Week'),
      what: l('Número de semana del año correspondiente a la fecha de venta/operación.', 'Week number of the year corresponding to trip/sale date.'),
      example: `${l('Semana', 'Week')} 8 (${new Date().getFullYear()})`,
      rule: l('Permite el análisis comparativo de tendencias semanales.', 'Enables comparative weekly trend analysis.')
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#002147] dark:bg-[#001733] text-white p-5 flex items-center justify-between border-b border-[#001733] dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00A3E0]/20 border border-[#00A3E0]/40 flex items-center justify-center text-[#00A3E0]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {l('Guía Oficial de Llenado, Fórmulas & Glosario', 'Official Operating Guide, Formulas & Glossary')}
              </h2>
              <p className="text-xs text-slate-300">
                Cancun Lighthouse Marina — {l('Manual Operativo', 'Operating Manual')} {new Date().getFullYear()}
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
              {l('Fórmulas Financieras Oficiales', 'Official Financial Formulas')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">1. {l('Subtotal con Over', 'Subtotal with Over')}</span>
                <code className="text-[11px] text-cyan-700 dark:text-cyan-300 font-mono block">
                  = {l('Costo Reporte Neto + Over', 'Net Cost + Over')}
                </code>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {l('Representa el costo directo real para la empresa.', 'Represents direct operational cost to the business.')}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">2. {l('Comisión Neta Repartible', 'Distributable Net Commission')}</span>
                <code className="text-[11px] text-cyan-700 dark:text-cyan-300 font-mono block">
                  = {l('Venta − Subtotal con Over', 'Sale Price − Subtotal with Over')}
                </code>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {l('Margen bruto antes de dividir entre vendedor y casa.', 'Gross margin before splitting between promoter and House.')}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">3. {l('Comisión Vendedor & Utilidad Casa', 'Promoter Commission & House Share')}</span>
                <code className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono block">
                  = {l('Comisión Neta / 2 (50% cada uno)', 'Net Commission / 2 (50% each)')}
                </code>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {l('Reparto 50/50 sobre el margen de venta.', '50/50 split on the sales margin.')}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">4. {l('Tarifa de Muellaje', 'Dockage Fee')}</span>
                <code className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono block">
                  = Total PAX × ($100 {l('ó', 'or')} $150 MXN)
                </code>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {l('$100 (1-3 hrs) | $150 (4-8 hrs) por persona.', '$100 (1-3 hrs) | $150 (4-8 hrs) per passenger.')}
                </p>
              </div>
            </div>
          </div>

          {/* Full Glossary Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#002147] dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#00A3E0]" />
              {l('Glosario de Columnas de la Base de Datos', 'Database Columns Glossary')}
            </h3>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-left divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-[#002147] dark:bg-[#001733] text-white text-[11px] uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">{l('Columna', 'Column')}</th>
                    <th className="p-2.5">{l('Definición', 'Definition')}</th>
                    <th className="p-2.5">{l('Ejemplo', 'Example')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {glossaryItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
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
            {l('Entendido, Cerrar Guía', 'Got it, Close Guide')}
          </button>
        </div>
      </div>
    </div>
  );
};
