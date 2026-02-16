'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { Input } from './input';
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from './pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  leftHeaderAction,
  headerAction,
  getRowClassName,
}: DataTableProps<TData, TValue> & {
  leftHeaderAction?: React.ReactNode;
  headerAction?: React.ReactNode;
  getRowClassName?: (row: Row<TData>) => string;
}) {
  const [globalFilter, setGlobalFilter] = useState([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    autoResetPageIndex: false,
    state: {
      globalFilter,
    },
  });

  return (
    <div>
      <div className="flex flex-col-reverse items-center justify-between gap-4 py-4 md:flex-row">
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <Input
            placeholder="Cari..."
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
              table.setPageIndex(0);
            }}
            className="max-w-sm"
          />
          {leftHeaderAction}
        </div>
        {headerAction}
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`}
                        ></div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={typeof getRowClassName === 'function' ? getRowClassName(row) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Data tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-end gap-2 py-4 md:flex-row">
        <div className="flex-1 text-sm text-muted-foreground">
          <div>
            Menampilkan
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(v) => {
                table.setPageSize(Number(v));
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger className="mx-2 inline-flex w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            dari {table.getRowCount().toLocaleString('id')} baris
          </div>
        </div>
        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} />
              </PaginationItem>
              {(() => {
                const pageCount = table.getPageCount();
                const pageIndex = table.getState().pagination.pageIndex;
                const pages: (number | 'ellipsis')[] = [];

                if (pageCount <= 7) {
                  for (let i = 0; i < pageCount; i++) pages.push(i);
                } else {
                  if (pageIndex < 4) {
                    const start = 0;
                    const end = 4;
                    for (let i = start; i <= end; i++) pages.push(i);
                    pages.push('ellipsis');
                    pages.push(pageCount - 1);
                  } else if (pageIndex < pageCount - 4) {
                    pages.push(0);
                    pages.push('ellipsis');
                    const start = Math.max(0, pageIndex - 2 + (pageIndex > 2 ? 1 : 0));
                    const end = Math.min(pageCount - 1, pageIndex + 2 - (pageIndex < pageCount - 3 ? 1 : 0));
                    for (let i = start; i <= end; i++) pages.push(i);
                    pages.push('ellipsis');
                    pages.push(pageCount - 1);
                  } else {
                    pages.push(0);
                    pages.push('ellipsis');
                    const start = pageCount - 5;
                    const end = pageCount - 1;
                    for (let i = start; i <= end; i++) pages.push(i);
                  }
                }
                return pages.map((page, index) =>
                  page === 'ellipsis' ? (
                    <PaginationEllipsis key={index} />
                  ) : (
                    <PaginationButton
                      key={index}
                      variant={page === pageIndex ? 'default' : 'outline'}
                      // className={page === pageIndex ? 'font-bold' : ''}
                      onClick={() => table.setPageIndex(page as number)}
                    >
                      {(page as number) + 1}
                    </PaginationButton>
                  ),
                );
              })()}
              <PaginationItem>
                <PaginationNext onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}