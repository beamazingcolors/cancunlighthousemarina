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
  Sparkles,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { motion } from 'motion/react';
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
  const [viewMode, setViewMode] = useState<'standard' | 'financial' | 'audit' | 'cards'>('standard');

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (filters.semana !== 'ALL' && record.semana !== filters.semana) return false;
      if (filters.actividad !== 'ALL' && record.actividad !== filters.actividad) return false;
      if (filters.locacion !== 'ALL' && record.locacion !== filters.locacion) return false;
      if (filters.promotor !== 'ALL' && record.promotor !== filters.promotor) return false;
      if (filters.proveedor !== 'ALL' && record.proveedor !== filters.proveedor) return false;
      if (filters.estatusCobro !== 'ALL' && record.estatusCobro !== filters.estatusCobro) return false;
      if (filters.moneda !== 'ALL' && record.moneda !== filters.moneda) return false;

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
      setSortAsc(false);
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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden w-full max-w-full min-w-0 transition-colors">
      {/* Control Bar: Filters & Search */}
      <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 space-y-3 min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 min-w-0">
          {/* Search bar */}
          <div className="relative flex-1 max-w-full lg:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-operations"
              type="text"
              placeholder="Buscar cupón, servicio, promotor, proveedor..."
              value={filters.searchQuery}
              onChange={(e) => {
                onFilterChange('searchQuery', e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-[#00A3E0]"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange('searchQuery', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Switcher + Export */}
          <div className="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto scrollbar-none max-w-full py-0.5">
            <div className="bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg flex text-xs font-medium border border-slate-300/60 dark:border-slate-700 overflow-x-auto scrollbar-none flex-shrink-0">
              <button
                id="btn-view-standard"
                onClick={() => setViewMode('standard')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md transition active:scale-95 cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
                  viewMode === 'standard'
                    ? 'bg-[#002147] dark:bg-[#00A3E0] text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Operativa
              </button>
              <button
                id="btn-view-financial"
                onClick={() => setViewMode('financial')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md transition active:scale-95 cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
                  viewMode === 'financial'
                    ? 'bg-[#002147] dark:bg-[#00A3E0] text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Financiera
              </button>
              <button
                id="btn-view-audit"
                onClick={() => setViewMode('audit')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md transition active:scale-95 cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
                  viewMode === 'audit'
                    ? 'bg-[#002147] dark:bg-[#00A3E0] text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Auditoría
              </button>
              <button
                id="btn-view-cards"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md transition active:scale-95 cursor-pointer whitespace-nowrap text-[11px] sm:text-xs flex items-center gap-1 ${
                  viewMode === 'cards'
                    ? 'bg-[#002147] dark:bg-[#00A3E0] text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Vista de Tarjetas Responsivas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
            </div>

            <button
              id="btn-table-export-csv"
              onClick={onExportCSV}
              className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex-shrink-0"
              title="Descargar datos en CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs min-w-0">
          {/* Week Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Semana ({new Date().getFullYear()})
            </label>
            <select
              id="select-filter-week"
              value={filters.semana}
              onChange={(e) => {
                onFilterChange('semana', e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md py-1.5 px-2 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#00A3E0] text-xs"
            >
              <option value="ALL">Todas las semanas {new Date().getFullYear()}</option>
              {availableWeeks.map(w => (
                <option key={w} value={w}>Semana {w} ({new Date().getFullYear()})</option>
              ))}
            </select>
          </div>

          {/* Activity Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Actividad</label>
            <select
              id="select-filter-activity"
              value={filters.actividad}
              onChange={(e) => {
                onFilterChange('actividad', e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md py-1.5 px-2 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#00A3E0] text-xs"
            >
              <option value="ALL">Todas las actividades</option>
              {availableActivities.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Locación</label>
            <select
              id="select-filter-location"
              value={filters.locacion}
              onChange={(e) => {
                onFilterChange('locacion', e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md py-1.5 px-2 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#00A3E0] text-xs"
            >
              <option value="ALL">Todas las locaciones</option>
              {availableLocations.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Promoter Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Promotor</label>
            <select
              id="select-filter-promoter"
              value={filters.promotor}
              onChange={(e) => {
                onFilterChange('promotor', e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md py-1.5 px-2 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#00A3E0] text-xs"
            >
              <option value="ALL">Todos los promotores</option>
              {availablePromoters.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Provider Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Proveedor</label>
            <select
              id="select-filter-provider"
              value={filters.proveedor}
              onChange={(e) => {
                onFilterChange('proveedor', e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md py-1.5 px-2 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#00A3E0] text-xs"
            >
              <option value="ALL">Todos los proveedores</option>
              {availableProviders.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Estatus Cobro Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Estatus</label>
            <select
              id="select-filter-status"
              value={filters.estatusCobro}
              onChange={(e) => {
                onFilterChange('estatusCobro', e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md py-1.5 px-2 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#00A3E0] text-xs"
            >
              <option value="ALL">Todos los estatus</option>
              <option value="Liquidado">Liquidado</option>
              <option value="Pendiente">Pendiente (Saldo &gt; 0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Mode 1: Responsive Cards View for Mobile/Tablet */}
      {viewMode === 'cards' ? (
        <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {paginatedRecords.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              No se encontraron registros con los filtros seleccionados.
            </div>
          ) : (
            paginatedRecords.map((r) => (
              <motion.div
                key={r.id}
                whileHover={{ y: -2 }}
                onClick={() => onSelectRecord(r)}
                className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#002147] text-sky-200 dark:bg-sky-950 dark:text-sky-300">
                      {r.cupon || `FOLIO-${r.rowIndex}`}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sem {r.semana}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    r.estatusCobro === 'Liquidado'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}>
                    {r.estatusCobro}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {r.actividad}: {r.servicio}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <span>{r.diaOperacion}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{r.locacion}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total PAX</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {r.pax.total} ({r.pax.adults}A, {r.pax.children}N, {r.pax.infants}I)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Ingresos Totales</span>
                    <span className="font-bold text-[#00A3E0] dark:text-sky-400">
                      {formatCurrencyMXN(r.ingresosTotalesMXN)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <span>Prom: {r.promotor || 'Directo'}</span>
                  <span className="text-[#00A3E0] group-hover:underline font-semibold flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Ver Detalle
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        /* View Mode 2: Full Responsive Data Table */
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#002147] text-white select-none text-[11px] uppercase tracking-wider font-semibold">
                <th onClick={() => handleSort('diaOperacion')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] whitespace-nowrap">
                  Fecha Operación {renderSortIndicator('diaOperacion')}
                </th>
                <th onClick={() => handleSort('cupon')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] whitespace-nowrap">
                  Folio / Cupón {renderSortIndicator('cupon')}
                </th>
                <th onClick={() => handleSort('actividad')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] whitespace-nowrap">
                  Actividad & Servicio {renderSortIndicator('actividad')}
                </th>
                <th onClick={() => handleSort('pax')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] text-center whitespace-nowrap">
                  PAX {renderSortIndicator('pax')}
                </th>
                <th onClick={() => handleSort('locacion')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] whitespace-nowrap">
                  Locación {renderSortIndicator('locacion')}
                </th>
                <th onClick={() => handleSort('promotor')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] whitespace-nowrap">
                  Promotor {renderSortIndicator('promotor')}
                </th>

                {viewMode === 'standard' && (
                  <>
                    <th onClick={() => handleSort('venta')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] text-right whitespace-nowrap">
                      Venta Original {renderSortIndicator('venta')}
                    </th>
                    <th onClick={() => handleSort('muelle')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] text-right whitespace-nowrap">
                      Muelle {renderSortIndicator('muelle')}
                    </th>
                    <th onClick={() => handleSort('ingresosTotalesMXN')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] text-right whitespace-nowrap">
                      Ingresos Totales (MXN) {renderSortIndicator('ingresosTotalesMXN')}
                    </th>
                    <th onClick={() => handleSort('utilidadOperativaMXN')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] text-right whitespace-nowrap">
                      Utilidad (MXN) {renderSortIndicator('utilidadOperativaMXN')}
                    </th>
                  </>
                )}

                {viewMode === 'financial' && (
                  <>
                    <th onClick={() => handleSort('costoReporteNeto')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] text-right whitespace-nowrap">
                      Costo Neto {renderSortIndicator('costoReporteNeto')}
                    </th>
                    <th onClick={() => handleSort('over')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] text-right whitespace-nowrap">
                      Over {renderSortIndicator('over')}
                    </th>
                    <th onClick={() => handleSort('comision')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] text-right whitespace-nowrap">
                      Comisión Vendedor {renderSortIndicator('comision')}
                    </th>
                    <th onClick={() => handleSort('casa')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] text-right whitespace-nowrap">
                      Utilidad Casa {renderSortIndicator('casa')}
                    </th>
                    <th onClick={() => handleSort('margenOperativo')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] text-right whitespace-nowrap">
                      Margen % {renderSortIndicator('margenOperativo')}
                    </th>
                  </>
                )}

                {viewMode === 'audit' && (
                  <>
                    <th onClick={() => handleSort('deposito')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] text-right whitespace-nowrap">
                      Depósito {renderSortIndicator('deposito')}
                    </th>
                    <th onClick={() => handleSort('balance')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] text-right whitespace-nowrap">
                      Balance Pendiente {renderSortIndicator('balance')}
                    </th>
                    <th onClick={() => handleSort('total')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] text-right whitespace-nowrap">
                      Total Cobrado {renderSortIndicator('total')}
                    </th>
                    <th className="px-3 py-2.5 text-center whitespace-nowrap">
                      Notas
                    </th>
                  </>
                )}

                <th onClick={() => handleSort('estatusCobro')} className="px-3 py-2.5 cursor-pointer hover:bg-[#002b5c] text-center whitespace-nowrap">
                  Estatus {renderSortIndicator('estatusCobro')}
                </th>
                <th className="px-3 py-2.5 text-center whitespace-nowrap">
                  Detalle
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-4 py-12 text-center text-slate-400">
                    No se encontraron operaciones registradas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r, index) => (
                  <tr 
                    key={r.id} 
                    onClick={() => onSelectRecord(r)}
                    className="hover:bg-sky-50/70 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
                  >
                    {/* Fecha */}
                    <td className="px-3 py-2.5 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                      <div>{r.diaOperacion}</div>
                      <div className="text-[10px] text-slate-400">Semana {r.semana}</div>
                    </td>

                    {/* Folio */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-[#002147] dark:text-sky-300 group-hover:text-[#00A3E0] transition-colors">
                        {r.cupon || `FOLIO-${r.rowIndex}`}
                      </span>
                    </td>

                    {/* Actividad & Servicio */}
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-normal">
                          {r.actividad}
                        </span>
                        <span>{r.servicio}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {r.horas > 0 ? `${r.horas} hrs` : ''} {r.proveedor ? `• Prov: ${r.proveedor}` : ''}
                      </div>
                    </td>

                    {/* PAX */}
                    <td className="px-3 py-2.5 whitespace-nowrap text-center">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {r.pax.total}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {r.pax.adults}A {r.pax.children > 0 ? `${r.pax.children}N` : ''} {r.pax.infants > 0 ? `${r.pax.infants}I` : ''}
                      </div>
                    </td>

                    {/* Locación */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-xs text-slate-700 dark:text-slate-300">{r.locacion}</span>
                    </td>

                    {/* Promotor */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{r.promotor || '—'}</span>
                    </td>

                    {/* Standard View Columns */}
                    {viewMode === 'standard' && (
                      <>
                        <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono">
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {formatCurrencySimple(r.venta, r.moneda)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono">
                          {r.muelle > 0 ? (
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              +{formatCurrencyMXN(r.muelle)}
                            </span>
                          ) : (
                            <span className="text-slate-400">$0</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrencyMXN(r.ingresosTotalesMXN)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono">
                          <span className={`font-bold ${r.utilidadOperativaMXN >= 0 ? 'text-[#00A3E0] dark:text-sky-400' : 'text-rose-600'}`}>
                            {formatCurrencyMXN(r.utilidadOperativaMXN)}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Financial View Columns */}
                    {viewMode === 'financial' && (
                      <>
                        <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-rose-700 dark:text-rose-400">
                          {formatCurrencySimple(r.costoReporteNeto, r.moneda)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-slate-700 dark:text-slate-300">
                          {formatCurrencySimple(r.over, r.moneda)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-slate-800 dark:text-slate-200 font-semibold">
                          {formatCurrencySimple(r.comision, r.moneda)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-[#002147] dark:text-sky-300 font-bold">
                          {formatCurrencySimple(r.casa, r.moneda)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold text-[10px]">
                            {formatPercent(r.margenOperativo)}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Audit View Columns */}
                    {viewMode === 'audit' && (
                      <>
                        <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-emerald-700 dark:text-emerald-400">
                          {formatCurrencySimple(r.deposito, r.moneda)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono">
                          <span className={r.balance > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}>
                            {formatCurrencySimple(r.balance, r.moneda)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrencySimple(r.total, r.moneda)}
                        </td>
                        <td className="px-3 py-2.5 max-w-xs truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {r.notas || '—'}
                        </td>
                      </>
                    )}

                    {/* Estatus */}
                    <td className="px-3 py-2.5 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.estatusCobro === 'Liquidado'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {r.estatusCobro === 'Liquidado' ? (
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1 text-amber-600 dark:text-amber-400" />
                        )}
                        {r.estatusCobro}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-3 py-2.5 whitespace-nowrap text-center text-slate-400 group-hover:text-[#00A3E0]">
                      <Eye className="w-4 h-4 mx-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <span>Mostrar:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value={10}>10 filas</option>
            <option value={20}>20 filas</option>
            <option value={50}>50 filas</option>
            <option value={100}>100 filas</option>
          </select>
          <span>de {sortedRecords.length} operaciones</span>
        </div>

        <div className="flex items-center space-x-1.5 self-center">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 cursor-pointer"
          >
            «
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 cursor-pointer"
          >
            Anterior
          </button>
          <span className="px-3 py-1 font-semibold text-slate-800 dark:text-slate-200">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 cursor-pointer"
          >
            Siguiente
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 cursor-pointer"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};
