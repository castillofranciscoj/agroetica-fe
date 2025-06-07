'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import {
  ArrowUp, ArrowDown, Loader, Eye, ArrowLeft,
} from 'lucide-react';
import { GET_PRODUCTS } from '@/graphql/operations';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

interface Product {
  id: string;
  name: string;
  registration_no: string;
  product_type: string;
  country: string;
  hazard_class?: string | null;
  N_pct?: number | null;
  P_pct?: number | null;
  K_pct?: number | null;
  composition_json?: unknown;
}

export default function ProductsPage() {
  const { lang } = useLanguage();

  const [globalFilter, setGlobalFilter] = useState('');
  const [authOnly, setAuthOnly] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize : 20,
  });
  const [selected, setSelected] = useState<Product | null>(null);

  /* ------------------------------------------------ GraphQL fetch */
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS, {
    variables: {
      take : pagination.pageSize,
      skip : pagination.pageIndex * pagination.pageSize,
      where: {
        AND: [
          globalFilter ? { name: { contains: globalFilter } } : {},
          authOnly     ? { stato_amministrativo: { startsWith: 'Autorizzato' } } : {},
        ],
      },
      orderBy: sorting[0]
        ? { [sorting[0].id]: sorting[0].desc ? 'desc' : 'asc' }
        : { name: 'asc' },
    },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => { refetch(); }, [sorting, pagination, globalFilter, authOnly]); // eslint-disable-line

  const products: Product[] = data?.products ?? [];
  const total               = data?.productsCount ?? 0;

  /* -------------------------------------------------- Table columns */
  const columns = useMemo<ColumnDef<Product>[]>(() => [
    {
      id    : 'view',
      header: '',
      cell  : ({ row }) => (
        <button
          onClick={() => setSelected(row.original)}
          className="text-green-600 hover:underline flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          {t[lang].viewLabel}
        </button>
      ),
      enableSorting   : false,
      enableFiltering : false,
    },
    { accessorKey: 'name',            header: () => t[lang].productName },
    { accessorKey: 'registration_no', header: () => t[lang].registrationNo },
    { accessorKey: 'product_type',    header: () => t[lang].productType },
    { accessorKey: 'country',         header: () => t[lang].countryLabel },
    { accessorKey: 'hazard_class',    header: () => t[lang].hazardClass,
      cell: info => info.getValue() || '—' },
  ], [lang]);

  const table = useReactTable({
    data  : products,
    columns,
    state : { sorting, globalFilter, pagination },
    onSortingChange      : setSorting,
    onPaginationChange   : setPagination,
    onGlobalFilterChange : setGlobalFilter,
    getCoreRowModel      : getCoreRowModel(),
    getSortedRowModel    : getSortedRowModel(),
    getFilteredRowModel  : getFilteredRowModel(),
    manualPagination     : true,
    pageCount            : Math.ceil(total / pagination.pageSize),
  });

  /* ================================================== DETAIL CARD */
  if (selected) {
    return (
      <div className="p-6 flex flex-col h-full">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center text-green-600 hover:underline mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          {t[lang].backLabel}
        </button>

        <h1 className="text-3xl font-bold mb-6">{selected.name}</h1>

        <div className="space-y-3 text-lg">
          <Detail label={t[lang].registrationNo} value={selected.registration_no} />
          <Detail label={t[lang].productType}    value={selected.product_type} />
          <Detail label={t[lang].hazardClass}    value={selected.hazard_class || '—'} />
          <Detail label="N %"    value={selected.N_pct ?? '—'} />
          <Detail label="P₂O₅%" value={selected.P_pct ?? '—'} />
          <Detail label="K₂O %" value={selected.K_pct ?? '—'} />
          {selected.composition_json && (
            <Detail
              label={t[lang].compositionLabel}
              value={JSON.stringify(selected.composition_json)}
            />
          )}
        </div>
      </div>
    );
  }

  /* ==================================================== TABLE VIEW */
  return (
    <div className="p-6 flex flex-col h-full overflow-hidden">
      <h1 className="text-3xl font-bold mb-4">{t[lang].productsPageTitle}</h1>

      {/* Search + checkbox */}
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder={t[lang].searchPlaceholder}
          value={globalFilter}
          onChange={e => {
            setGlobalFilter(e.target.value.toUpperCase());
            setPagination(p => ({ ...p, pageIndex: 0 }));
          }}
          className="border px-3 py-1.5 rounded w-full md:w-80 uppercase"
        />
        <label className="inline-flex items-center text-sm select-none">
          <input
            type="checkbox"
            checked={authOnly}
            onChange={e => {
              setAuthOnly(e.target.checked);
              setPagination(p => ({ ...p, pageIndex: 0 }));
            }}
            className="mr-2"
          />
          {t[lang].authorisedOnly}
        </label>
      </div>

      {/* Table + pagination fill remaining height  ------------------ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th
                      key={h.id}
                      colSpan={h.colSpan}
                      className="px-3 py-2 text-left font-semibold cursor-pointer select-none"
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{
                        asc : <ArrowUp   className="inline w-4 h-4 ml-1" />,
                        desc: <ArrowDown className="inline w-4 h-4 ml-1" />,
                      }[h.column.getIsSorted() as string] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={columns.length} className="p-4 text-center">
                    <Loader className="animate-spin inline-block w-5 h-5 mr-1" />
                    {t[lang].loadingLabel}
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={columns.length} className="p-4 text-center text-red-600">
                    {t[lang].errorLoadingData}
                  </td>
                </tr>
              )}
              {!loading && !error && table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="p-4 text-center text-gray-500">
                    {t[lang].noData}
                  </td>
                </tr>
              )}
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="even:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex-shrink-0 flex items-center justify-between mt-4 gap-3 flex-wrap">
          <div className="text-sm">
            {t[lang].pageLabel} {pagination.pageIndex + 1} {t[lang].ofLabel}{' '}
            {table.getPageCount()}
          </div>
          <div className="space-x-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 border rounded disabled:opacity-50"
            >
              {t[lang].prev}
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 border rounded disabled:opacity-50"
            >
              {t[lang].next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* helper ------------------------------------------------------------ */
const Detail = ({ label, value }: { label: string; value: unknown }) => (
  <div>
    <span className="font-semibold">{label}:</span> {value}
  </div>
);
