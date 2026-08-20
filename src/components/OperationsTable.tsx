import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Download, 
  CheckCircle2, 
  Clock, 
  Info,
  Calendar,
  DollarSign,
  User,
  Anchor,
  Sparkles
} from 'lucide-react';
import { OperationRecord, FilterState } from '../types/marina';
import { formatCurrencyMXN, formatCurrencySimple, formatPercent } from '../utils/formatters';
import { formatPaxDetail } from '../utils/paxUtils';

interface OperationsTableProps {
  records: OperationRecord[];
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onSelectRecord: (record: OperationRecord) => void;
  onExportCSV: () => void;
  availableWeeks: string[];
  availableActivities: string[];
  availableLocations: string[];
  availablePromoters: string[];
  availableProviders: string[];
}

type SortField = 
  | 'diaOperacion'
  | 'diaReserva'
  | 'cupon'
  | 'actividad'
  | 'servicio'
  | 'pax'
  | 'horas'
  | 'locacion'
  | 'promotor'
  | 'proveedor'
  | 'costoReporteNeto'
  | 'over'
  | 'subtotalConOver'
  | 'venta'
  | 'ventaMXN'
  | 'comision'
  | 'casa'
  | 'deposito'
  | 'balance'
  | 'total'
  | 'muelle'
  | 'ingresosTotalesMXN'
  | 'utilidadOperativaMXN'
  | 'margenOperativo'
  | 'estatusCobro'
  | 'semana';

export const OperationsTable: React.FC<OperationsTableProps> = ({
  records,
  filters,
  onFilterChange,
  onSelectRecord,
  onExportCSV,
  availableWeeks,
  availableActivities,
  availableLocations,
  availablePromoters,
  availableProviders
}) => {
  const [sortField, setSortField] = useState<SortField>('diaOperacion');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [viewMode, setViewMode] = useState<'standard' | 'financial' | 'audit'>('standard');

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Week filter
      if (filters.semana !== 'ALL' && record.semana !== filters.semana) {
        return false;
      }
      // Activity filter
      if (filters.actividad !== 'ALL' && record.actividad !== filters.actividad) {
        return false;
      }
      // Location filter
      if (filters.locacion !== 'ALL' && record.locacion !== filters.locacion) {
        return false;
      }
      // Promoter filter
      if (filters.promotor !== 'ALL' && record.promotor !== filters.promotor) {
        return false;
      }
      // Provider filter
      if (filters.proveedor !== 'ALL' && record.proveedor !== filters.proveedor) {
        return false;
      }
      // Estatus filter
      if (filters.estatusCobro !== 'ALL' && record.estatusCobro !== filters.estatusCobro) {
        return false;
      }
      // Moneda filter
      if (filters.moneda !== 'ALL' && record.moneda !== filters.moneda) {
        return false;
      }

      // Search query filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchFolio = record.cupon.toLowerCase().includes(query);
        const matchServ = record.servicio.toLowerCase().includes(query);
        const matchAct = record.actividad.toLowerCase().includes(query);
        const matchProm = record.promotor.toLowerCase().includes(query);
        const matchProv = record.proveedor.toLowerCase().includes(query);
        const matchNotas = record.notas.toLowerCase().includes(query);
        if (!matchFolio && !matchServ && !matchAct && !matchProm && !matchProv && !matchNotas) {
          return false;
        }
      }

      return true;
    });
  }, [records, filters]);

  // Sort records
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'pax') {
        aVal = a.pax.total;
        bVal = b.pax.total;
      }

      if (typeof aVal === 'string') {
        return sortAsc 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      aVal = aVal || 0;
      bVal = bVal || 0;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
  }, [filteredRecords, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default desc for numbers
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortAsc ? (
      <ChevronUp className="w-3.5 h-3.5 inline ml-0.5 text-cyan-400" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 inline ml-0.5 text-cyan-400" />
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Control Bar: Filters & Search */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-operations"
              type="text"
              placeholder="Buscar por cupón, servicio, promotor, proveedor..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange('searchQuery', e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange('searchQuery', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Switcher + Export */}
          <div className="flex items-center space-x-2">
            <div className="bg-slate-200/80 p-0.5 rounded-lg flex text-xs font-medium border border-slate-300/60">
              <button
                id="btn-view-standard"
                onClick={() => setViewMode('standard')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'standard'
                    ? 'bg-[#002147] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Operativa
              </button>
              <button
                id="btn-view-financial"
                onClick={() => setViewMode('financial')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'financial'
                    ? 'bg-[#002147] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Financiera & Utilidades
              </button>
              <button
                id="btn-view-audit"
                onClick={() => setViewMode('audit')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'audit'
                    ? 'bg-[#002147] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Auditoría Muelle & Cobranza
              </button>
            </div>

            <button
              id="btn-export-csv-table"
              onClick={onExportCSV}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          {/* Week Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Semana</label>
            <select
              id="select-filter-week"
              value={filters.semana}
              onChange={(e) => onFilterChange('semana', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 focus:ring-1 focus:ring-[#00A3E0] text-xs"
            >
              <option value="ALL">Todas las semanas</option>
              {availableWeeks.map(w => (
                <option key={w} value={w}>Semana {w}</option>
              ))}
            </select>
          </div>

          {/* Activity Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Actividad</label>
            <select
              id="select-filter-activity"
              value={filters.actividad}
              onChange={(e) => onFilterChange('actividad', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 focus:ring-1 focus:ring-[#00A3E0] text-xs"
            >
              <option value="ALL">Todas las actividades</option>
              {availableActivities.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Locación</label>
            <select
              id="select-filter-location"
              value={filters.locacion}
              onChange={(e) => onFilterChange('locacion', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 focus:ring-1 focus:ring-[#00A3E0] text-xs"
            >
              <option value="ALL">Todas las locaciones</option>
              {availableLocations.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Estatus Cobro</label>
            <select
              id="select-filter-status"
              value={filters.estatusCobro}
              onChange={(e) => onFilterChange('estatusCobro', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 focus:ring-1 focus:ring-[#00A3E0] text-xs"
            >
              <option value="ALL">Todos los estatus</option>
              <option value="Liquidado">Liquidado</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>

          {/* Promoter Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Promotor</label>
            <select
              id="select-filter-promoter"
              value={filters.promotor}
              onChange={(e) => onFilterChange('promotor', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 focus:ring-1 focus:ring-[#00A3E0] text-xs truncate"
            >
              <option value="ALL">Todos los promotores</option>
              {availablePromoters.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Provider Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Proveedor</label>
            <select
              id="select-filter-provider"
              value={filters.proveedor}
              onChange={(e) => onFilterChange('proveedor', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 focus:ring-1 focus:ring-[#00A3E0] text-xs truncate"
            >
              <option value="ALL">Todos los proveedores</option>
              {availableProviders.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Results Summary */}
      <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div>
          Mostrando <span className="font-bold text-[#002147]">{filteredRecords.length}</span> operaciones
          {filters.semana !== 'ALL' && <span> en Semana {filters.semana}</span>}
        </div>
        <div className="text-[11px] text-slate-500 hidden sm:block">
          Haz clic en cualquier fila para ver el desglose del comprobante
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table id="operations-data-table" className="w-full text-left text-xs text-slate-700">
          <thead className="bg-[#002147] text-white text-[11px] uppercase font-semibold tracking-wider">
            <tr>
              <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap" onClick={() => handleSort('cupon')}>
                Cupón / Folio {renderSortIndicator('cupon')}
              </th>
              <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap" onClick={() => handleSort('diaOperacion')}>
                Fecha Op. {renderSortIndicator('diaOperacion')}
              </th>
              <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap" onClick={() => handleSort('actividad')}>
                Actividad {renderSortIndicator('actividad')}
              </th>
              <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap" onClick={() => handleSort('servicio')}>
                Servicio {renderSortIndicator('servicio')}
              </th>
              <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap" onClick={() => handleSort('pax')}>
                PAX (Ad·Ni·In) {renderSortIndicator('pax')}
              </th>
              
              {/* Columns change according to viewMode */}
              {viewMode === 'standard' && (
                <>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap" onClick={() => handleSort('locacion')}>
                    Locación {renderSortIndicator('locacion')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap" onClick={() => handleSort('promotor')}>
                    Promotor {renderSortIndicator('promotor')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap" onClick={() => handleSort('proveedor')}>
                    Proveedor {renderSortIndicator('proveedor')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-right" onClick={() => handleSort('venta')}>
                    Venta {renderSortIndicator('venta')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-right" onClick={() => handleSort('muelle')}>
                    Muelle {renderSortIndicator('muelle')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-right" onClick={() => handleSort('utilidadOperativaMXN')}>
                    Utilidad MXN {renderSortIndicator('utilidadOperativaMXN')}
                  </th>
                </>
              )}

              {viewMode === 'financial' && (
                <>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-right" onClick={() => handleSort('costoReporteNeto')}>
                    Costo Neto {renderSortIndicator('costoReporteNeto')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-right" onClick={() => handleSort('over')}>
                    Over {renderSortIndicator('over')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-right" onClick={() => handleSort('subtotalConOver')}>
                    Subtotal Over {renderSortIndicator('subtotalConOver')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-right" onClick={() => handleSort('ventaMXN')}>
                    Venta MXN {renderSortIndicator('ventaMXN')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-right" onClick={() => handleSort('comision')}>
                    Comisión {renderSortIndicator('comision')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-right" onClick={() => handleSort('casa')}>
                    Casa {renderSortIndicator('casa')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-right" onClick={() => handleSort('margenOperativo')}>
                    Margen % {renderSortIndicator('margenOperativo')}
                  </th>
                </>
              )}

              {viewMode === 'audit' && (
                <>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-center" onClick={() => handleSort('horas')}>
                    Horas {renderSortIndicator('horas')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-right" onClick={() => handleSort('muelle')}>
                    Muelle Cobrado {renderSortIndicator('muelle')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-right" onClick={() => handleSort('deposito')}>
                    Depósito {renderSortIndicator('deposito')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-right" onClick={() => handleSort('balance')}>
                    Balance (Pend.) {renderSortIndicator('balance')}
                  </th>
                  <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-right" onClick={() => handleSort('total')}>
                    Total Pagado {renderSortIndicator('total')}
                  </th>
                </>
              )}

              <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-[#001733] whitespace-nowrap text-center" onClick={() => handleSort('estatusCobro')}>
                Estatus {renderSortIndicator('estatusCobro')}
              </th>
              <th scope="col" className="px-3 py-3 text-center">
                Detalle
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-slate-400">
                  No se encontraron operaciones con los filtros aplicados.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((r, idx) => (
                <tr 
                  key={r.id}
                  id={`row-op-${r.rowIndex}`}
                  onClick={() => onSelectRecord(r)}
                  className="hover:bg-[#00A3E0]/5 transition-colors cursor-pointer"
                >
                  {/* Cupon / Folio */}
                  <td className="px-3 py-2.5 font-mono font-medium text-slate-900 whitespace-nowrap">
                    <span className="bg-slate-100 text-[#002147] px-1.5 py-0.5 rounded border border-slate-200 font-bold text-[11px]">
                      {r.cupon || `OP-${r.rowIndex}`}
                    </span>
                  </td>

                  {/* Fecha de Operación */}
                  <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">
                    <div>{r.diaOperacion}</div>
                    {r.diaReserva !== r.diaOperacion && (
                      <div className="text-[10px] text-slate-400">Res: {r.diaReserva}</div>
                    )}
                  </td>

                  {/* Actividad */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      r.actividad === 'Yate' 
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : r.actividad === 'Tour'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : r.actividad === 'Marina' || r.actividad === 'Muelle'
                        ? 'bg-sky-50 text-[#007ba8] border border-sky-200'
                        : 'bg-purple-50 text-purple-800 border border-purple-200'
                    }`}>
                      {r.actividad}
                    </span>
                  </td>

                  {/* Servicio */}
                  <td className="px-3 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                    {r.servicio}
                  </td>

                  {/* PAX (Special notation breakdown) */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-[#002147] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] border border-slate-200">
                        {r.paxRaw}
                      </span>
                      <span className="text-[10px] text-slate-500 hidden sm:inline">
                        ({r.pax.adults}A {r.pax.children > 0 ? `· ${r.pax.children}N` : ''} {r.pax.infants > 0 ? `· ${r.pax.infants}I` : ''})
                      </span>
                    </div>
                  </td>

                  {/* Dynamic Columns based on viewMode */}
                  {viewMode === 'standard' && (
                    <>
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">
                        {r.locacion}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-800">
                        {r.promotor}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-600 text-[11px]">
                        {r.proveedor}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono font-semibold text-slate-900">
                        {formatCurrencySimple(r.venta, r.moneda)} {r.moneda !== 'MXN' && `(${r.moneda})`}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-[#007ba8]">
                        {r.muelle > 0 ? formatCurrencyMXN(r.muelle) : '-'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono font-bold text-emerald-700">
                        {formatCurrencyMXN(r.utilidadOperativaMXN)}
                      </td>
                    </>
                  )}

                  {viewMode === 'financial' && (
                    <>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-slate-600">
                        {formatCurrencySimple(r.costoReporteNeto, r.moneda)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-rose-700 font-medium">
                        {r.over > 0 ? formatCurrencySimple(r.over, r.moneda) : '-'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-slate-800">
                        {formatCurrencySimple(r.subtotalConOver, r.moneda)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                        {formatCurrencyMXN(r.ventaMXN)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-amber-700">
                        {formatCurrencyMXN(r.comisionMXN)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono font-semibold text-[#002147]">
                        {formatCurrencyMXN(r.casa)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono font-bold text-[#007ba8]">
                        {formatPercent(r.margenOperativo)}
                      </td>
                    </>
                  )}

                  {viewMode === 'audit' && (
                    <>
                      <td className="px-3 py-2.5 whitespace-nowrap text-center text-slate-700 font-mono">
                        {r.horas > 0 ? `${r.horas} hrs` : '-'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono font-medium text-slate-900">
                        {r.muelle > 0 ? formatCurrencyMXN(r.muelle) : '-'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-emerald-700 font-semibold">
                        {r.deposito > 0 ? formatCurrencySimple(r.deposito, r.moneda) : '-'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono font-bold text-amber-700">
                        {r.balance > 0 ? formatCurrencySimple(r.balance, r.moneda) : '-'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                        {formatCurrencySimple(r.total, r.moneda)}
                      </td>
                    </>
                  )}

                  {/* Estatus */}
                  <td className="px-3 py-2.5 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.estatusCobro === 'Liquidado'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {r.estatusCobro === 'Liquidado' ? (
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1 text-amber-600" />
                      )}
                      {r.estatusCobro}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-3 py-2.5 whitespace-nowrap text-center text-slate-400 hover:text-[#00A3E0]">
                    <Eye className="w-4 h-4 mx-auto" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <span>Mostrar:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
          >
            <option value={10}>10 filas</option>
            <option value={20}>20 filas</option>
            <option value={50}>50 filas</option>
            <option value={100}>100 filas</option>
          </select>
          <span>de {sortedRecords.length} operaciones filtradas</span>
        </div>

        <div className="flex items-center space-x-1.5 self-center">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            «
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            Anterior
          </button>
          <span className="px-3 py-1 font-semibold text-slate-800">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            Siguiente
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};
