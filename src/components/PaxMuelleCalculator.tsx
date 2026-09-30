import React, { useState } from 'react';
import { 
  Calculator, 
  Users, 
  Anchor, 
  Clock, 
  DollarSign, 
  Sparkles, 
  TrendingUp,
  ShieldCheck,
  Ship
} from 'lucide-react';
import { parsePax } from '../utils/paxUtils';
import { formatCurrencyMXN, formatPercent } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

export const PaxMuelleCalculator: React.FC = () => {
  const { language, l } = useLanguage();

  // Simulator inputs
  const [paxInput, setPaxInput] = useState<string>('2.2.1');
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(2);
  const [infants, setInfants] = useState<number>(1);
  const [horas, setHoras] = useState<number>(4);
  const [actividad, setActividad] = useState<string>('Yate');
  const [costoReporteNeto, setCostoReporteNeto] = useState<number>(12000);
  const [over, setOver] = useState<number>(1000);
  const [venta, setVenta] = useState<number>(16000);
  const [deposito, setDeposito] = useState<number>(4000);

  // Sync string input with sliders
  const handlePaxInputChange = (val: string) => {
    setPaxInput(val);
    const parsed = parsePax(val);
    setAdults(parsed.adults);
    setChildren(parsed.children);
    setInfants(parsed.infants);
  };

  // Sync sliders with string
  const handleSliderChange = (newAd: number, newCh: number, newInf: number) => {
    setAdults(newAd);
    setChildren(newCh);
    setInfants(newInf);
    let str = `${newAd}`;
    if (newInf > 0) {
      str = `${newAd}.${newCh}.${newInf}`;
    } else if (newCh > 0) {
      str = `${newAd}.${newCh}`;
    }
    setPaxInput(str);
  };

  // Calculated values
  const totalPax = adults + children + infants;
  const muelleFeePerPax = horas >= 4 ? 150 : horas >= 1 ? 100 : 0;
  const totalMuelle = totalPax * muelleFeePerPax;
  const subtotalConOver = costoReporteNeto + over;
  const comisionNeta = Math.max(0, venta - subtotalConOver);
  const comisionVendedor = comisionNeta / 2;
  const utilidadCasa = comisionNeta / 2;
  const saldoPendiente = Math.max(0, venta - deposito);
  const ingresosTotales = venta + totalMuelle;
  const utilidadOperativa = (ingresosTotales - subtotalConOver - comisionVendedor);
  const margenOperativo = ingresosTotales > 0 ? (utilidadOperativa / ingresosTotales) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Introduction */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#002147] dark:bg-[#001733] text-[#00A3E0] flex items-center justify-center shadow-md shadow-[#002147]/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#002147] dark:text-[#66d2ff]">
              {l('Calculadora & Simulador: Notación PAX y Cobro de Muellaje', 'Calculator & Simulator: PAX Notation & Dock Fee Calculation')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {l('Herramienta oficial de cotización para staff y ejecutivos de Cancun Lighthouse Marina', 'Official quotation tool for Cancun Lighthouse Marina staff and executives')}
            </p>
          </div>
        </div>

        {/* Business rules banner */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/70">
          <div className="space-y-1.5">
            <span className="font-bold text-[#002147] dark:text-sky-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#002147] dark:text-sky-300" />
              {l('Regla de Notación PAX:', 'PAX Notation Rule:')}
            </span>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 text-[11px]">
              <li><strong className="text-slate-800 dark:text-white">{l('1er número:', '1st number:')}</strong> {l('Cantidad de Adultos (ej. 2)', 'Adult count (e.g. 2)')}</li>
              <li><strong className="text-slate-800 dark:text-white">{l('1er punto (.):', '1st dot (.):')}</strong> {l('Cantidad de Menores / Niños (ej. 2.1)', 'Child / Minor count (e.g. 2.1)')}</li>
              <li><strong className="text-slate-800 dark:text-white">{l('2do punto (.):', '2nd dot (.):')}</strong> {l('Cantidad de Infantes (ej. 2.2.1 = 5 PAX)', 'Infant count (e.g. 2.2.1 = 5 PAX)')}</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-[#002147] dark:text-sky-300 flex items-center gap-1.5">
              <Anchor className="w-4 h-4 text-[#00A3E0]" />
              {l('Regla de Cobro de Muellaje:', 'Dockage Fee Rule:')}
            </span>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 text-[11px]">
              <li><strong className="text-slate-800 dark:text-white">{l('1 a 3 horas:', '1 to 3 hours:')}</strong> {l('$100 MXN por pasajero (PAX)', '$100 MXN per passenger (PAX)')}</li>
              <li><strong className="text-slate-800 dark:text-white">{l('4 a 8 horas:', '4 to 8 hours:')}</strong> {l('$150 MXN por pasajero (PAX)', '$150 MXN per passenger (PAX)')}</li>
              <li>{l('El muellaje se cobra por persona sobre el PAX total.', 'Dock fee is charged per person on total PAX.')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Results Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-[#002147] dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>{l('Parámetros de la Cotización', 'Quotation Parameters')}</span>
            <span className="text-[11px] font-normal text-slate-400">{l('Paso a paso', 'Step by step')}</span>
          </h3>

          {/* PAX String Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {l('Código PAX (Notación Rápida)', 'PAX Code (Quick Notation)')}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={paxInput}
                onChange={(e) => handlePaxInputChange(e.target.value)}
                placeholder={l('ej. 2.2.1 o 4.1 o 8', 'e.g. 2.2.1 or 4.1 or 8')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A3E0] focus:outline-none"
              />
              <span className="text-xs bg-sky-50 dark:bg-sky-950/60 text-[#002147] dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold px-3 py-2 rounded-lg font-mono whitespace-nowrap">
                {totalPax} {l('PAX Total', 'Total PAX')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {l('Escribe directamente el código (ej. "2" = 2 adultos | "2.1" = 2 ad, 1 niño | "2.2.1" = 2 ad, 2 niños, 1 infante)', 'Enter notation directly (e.g. "2" = 2 adults | "2.1" = 2 ad, 1 kid | "2.2.1" = 2 ad, 2 kids, 1 infant)')}
            </p>
          </div>

          {/* Sliders Breakdown */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{l('Adultos:', 'Adults:')}</span>
                <span className="font-mono font-bold text-[#002147] dark:text-sky-300">{adults}</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={adults}
                onChange={(e) => handleSliderChange(Number(e.target.value), children, infants)}
                className="w-full accent-[#002147] dark:accent-[#00A3E0]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{l('Niños / Menores:', 'Children / Minors:')}</span>
                <span className="font-mono font-bold text-[#00A3E0]">{children}</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={children}
                onChange={(e) => handleSliderChange(adults, Number(e.target.value), infants)}
                className="w-full accent-[#00A3E0]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{l('Infantes:', 'Infants:')}</span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-400">{infants}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={infants}
                onChange={(e) => handleSliderChange(adults, children, Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
          </div>

          {/* Hours and Activity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {l('Horas de Renta (Yate / Lancha)', 'Rental Hours (Yacht / Boat)')}
              </label>
              <select
                value={horas}
                onChange={(e) => setHoras(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A3E0]"
              >
                <option value={1}>{l('1 Hora ($100 MXN/pax)', '1 Hour ($100 MXN/pax)')}</option>
                <option value={2}>{l('2 Horas ($100 MXN/pax)', '2 Hours ($100 MXN/pax)')}</option>
                <option value={3}>{l('3 Horas ($100 MXN/pax)', '3 Hours ($100 MXN/pax)')}</option>
                <option value={4}>{l('4 Horas ($150 MXN/pax)', '4 Hours ($150 MXN/pax)')}</option>
                <option value={5}>{l('5 Horas ($150 MXN/pax)', '5 Hours ($150 MXN/pax)')}</option>
                <option value={6}>{l('6 Horas ($150 MXN/pax)', '6 Hours ($150 MXN/pax)')}</option>
                <option value={8}>{l('8 Horas ($150 MXN/pax)', '8 Hours ($150 MXN/pax)')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {l('Tipo de Actividad', 'Activity Type')}
              </label>
              <select
                value={actividad}
                onChange={(e) => setActividad(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A3E0]"
              >
                <option value="Yate">{l('Yate', 'Yacht')}</option>
                <option value="Tour">{l('Tour', 'Tour')}</option>
                <option value="Marina">{l('Marina', 'Marina')}</option>
                <option value="Pernota">{l('Pernota', 'Overnight')}</option>
              </select>
            </div>
          </div>

          {/* Pricing parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                {l('Costo Proveedor', 'Vendor Cost')}
              </label>
              <input
                type="number"
                value={costoReporteNeto}
                onChange={(e) => setCostoReporteNeto(Number(e.target.value))}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                {l('Over Empresa', 'Company Over')}
              </label>
              <input
                type="number"
                value={over}
                onChange={(e) => setOver(Number(e.target.value))}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                {l('Precio Venta', 'Sale Price')}
              </label>
              <input
                type="number"
                value={venta}
                onChange={(e) => setVenta(Number(e.target.value))}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                {l('Depósito', 'Deposit')}
              </label>
              <input
                type="number"
                value={deposito}
                onChange={(e) => setDeposito(Number(e.target.value))}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Simulation Output Box */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#002147] to-[#001733] text-white p-6 rounded-2xl border border-[#001733] shadow-lg flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                {l('Resultado de Cotización', 'Quotation Summary')}
              </span>
              <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded">
                {l('Oficial Marina', 'Marina Official')}
              </span>
            </div>

            {/* Muellaje specific highlight */}
            <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5 text-[#00A3E0]" />
                  {l(`Muellaje (${totalPax} PAX × $${muelleFeePerPax}):`, `Dockage (${totalPax} PAX × $${muelleFeePerPax}):`)}
                </span>
                <span className="text-base font-mono font-black text-emerald-400">
                  +{formatCurrencyMXN(totalMuelle)}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {l(`${horas} hrs de renta = $${muelleFeePerPax} MXN por cada pasajero`, `${horas} hrs rental = $${muelleFeePerPax} MXN per passenger`)}
              </p>
            </div>

            {/* Financial breakdown */}
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-300">{l('Precio Venta Original:', 'Original Sale Price:')}</span>
                <span className="font-mono font-semibold">{formatCurrencyMXN(venta)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-300">{l('Ingresos Totales (Venta + Muelle):', 'Total Revenue (Sale + Dockage):')}</span>
                <span className="font-mono font-bold text-cyan-300">{formatCurrencyMXN(ingresosTotales)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-300">{l('Subtotal con Over:', 'Subtotal with Over:')}</span>
                <span className="font-mono text-rose-300">{formatCurrencyMXN(subtotalConOver)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-300">{l('Comisión Vendedor (50% margen):', 'Promoter Commission (50% net):')}</span>
                <span className="font-mono text-amber-300">{formatCurrencyMXN(comisionVendedor)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-300">{l('Utilidad Casa (50% margen):', 'House Profit (50% net):')}</span>
                <span className="font-mono text-sky-300 font-bold">{formatCurrencyMXN(utilidadCasa)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-300">{l('Saldo Pendiente de Cobro:', 'Pending Balance to Collect:')}</span>
                <span className="font-mono text-amber-400 font-bold">{formatCurrencyMXN(saldoPendiente)}</span>
              </div>
            </div>
          </div>

          {/* Bottom Net Summary */}
          <div className="pt-4 border-t border-white/10 bg-black/20 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-300 block">{l('Utilidad Operativa Total', 'Total Operating Profit')}</span>
                <span className="text-2xl font-mono font-black text-emerald-400">
                  {formatCurrencyMXN(utilidadOperativa)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-300 block">{l('Margen Rentable', 'Profit Margin')}</span>
                <span className="text-xl font-mono font-bold text-cyan-300">
                  {formatPercent(margenOperativo)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
