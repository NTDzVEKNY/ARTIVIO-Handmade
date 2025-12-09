'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

// Button styles for pagination, matching the client-side theme
const paginationButtonStyles: React.CSSProperties = {
  backgroundColor: '#F7F1E8',
  color: '#3F2E23',
  borderColor: '#D96C39',
  borderWidth: '1px',
};

const paginationButtonDisabledStyles: React.CSSProperties = {
  ...paginationButtonStyles,
  opacity: 0.5,
  cursor: 'not-allowed',
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className="rounded-md" style={{border: '1px solid #E8D5B5'}}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <button
          className="px-4 py-2 text-sm rounded-md font-medium shadow-sm transition-transform transform hover:scale-105"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          style={!table.getCanPreviousPage() ? paginationButtonDisabledStyles : paginationButtonStyles}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 text-sm rounded-md font-medium shadow-sm transition-transform transform hover:scale-105"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          style={!table.getCanNextPage() ? paginationButtonDisabledStyles : paginationButtonStyles}
        >
          Next
        </button>
      </div>
    </div>
  );
}