'use client';

import { ColumnDef, flexRender, getCoreRowModel, OnChangeFn, PaginationState, useReactTable } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
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

export function DataTableServer<TData, TValue>({
    columns,
    data,
    headerAction,
    pagination,
    setPagination,
    rowCount,
    isLoading = false,
}: DataTableProps<TData, TValue> & {
    headerAction: React.ReactNode;
    pagination: PaginationState;
    setPagination: OnChangeFn<PaginationState>;
    rowCount: number;
    isLoading?: boolean;
}) {
    //   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    //     []
    //   )
    // const [globalFilter, setGlobalFilter] = useState([]);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        onPaginationChange: setPagination,
        rowCount,
        // onColumnFiltersChange: setColumnFilters,
        // onGlobalFilterChange: setGlobalFilter,
        // getFilteredRowModel: getFilteredRowModel(),
        // enableColumnResizing: true,
        // columnResizeMode: "onChange",
        state: {
            // columnFilters,
            pagination,
            // globalFilter,
        },
    });

    return (
        <div>
            <div className="flex flex-col-reverse items-center justify-between gap-4 py-4 md:flex-row">
                {/* <div></div> */}
                {/* <Input
                    placeholder="Cari..."
                    // value={(table.getglobal() as string) ?? ""}
                    onChange={(event) => table.setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                /> */}
                {headerAction}
            </div>
            <div className="rounded-md border">
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
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" />
                                        Memuat...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
                                    if (pageIndex > 2) {
                                        pages.push(0);
                                        if (pageIndex > 2) pages.push('ellipsis');
                                    }
                                    const start = Math.max(0, pageIndex - 2);
                                    const end = Math.min(pageCount - 1, pageIndex + 2);
                                    for (let i = start; i <= end; i++) pages.push(i);
                                    if (pageIndex < pageCount - 3) {
                                        if (pageIndex < pageCount - 3) pages.push('ellipsis');
                                        pages.push(pageCount - 1);
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
