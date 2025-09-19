import * as React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  useReactTable,
  getFilteredRowModel,
  type VisibilityState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "./ui/input"
import { DataTablePagination } from "./ui/data-table-pagination"
import { DataTableViewOptions } from "./ui/data-table-column-toggle"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

interface ActionItem<TData> {
  label: string
  onClick: (row: TData) => void
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchColumns?: string[]
  showActionsColumn?: boolean
  onViewDetails?: (row: TData) => void
  actionItems?: ActionItem<TData>[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumns = [],
  showActionsColumn = false,
  onViewDetails,
  actionItems = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const finalColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!showActionsColumn) return columns

    const actionsColumn: ColumnDef<TData, TValue> = {
      id: "actions" as any,
      header: "Actions" as any,
      cell: ({ row }) => {
        const original = row.original as TData
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails?.(original)}>
                View Details
              </DropdownMenuItem>
              {(actionItems && actionItems.length > 0) && (
                <DropdownMenuSeparator />
              )}
              {actionItems?.map((item, index) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => item.onClick(original)}
                    className={item.className}
                  >
                    {Icon ? <Icon className={item.className} /> : null}
                    {item.label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }

    return [...columns, actionsColumn]
  }, [columns, showActionsColumn, actionItems, onViewDetails])

  const table = useReactTable({
    data,
    columns: finalColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, value) => {
      // Get the searchable columns
      const searchableColumns = searchColumns.length > 0 ? searchColumns : finalColumns.map(col => (col as any).accessorKey).filter(Boolean);
      
      // Check if any of the searchable columns contain the search value
      return searchableColumns.some(columnKey => {
        const cellValue = row.getValue(columnKey as string);
        if (cellValue == null) return false;
        
        return String(cellValue)
          .toLowerCase()
          .includes(String(value).toLowerCase());
      });
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  })

  // Separate action column from other columns
  const dataColumns = React.useMemo(() => {
    return finalColumns.filter(col => (col as any).id !== "actions")
  }, [finalColumns])

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder={`Search`}
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <DataTableViewOptions table={table} />
      </div>
      <div className="relative overflow-hidden rounded-md border">
        {showActionsColumn ? (
          <div className="relative">
            {/* Scrollable content area */}
            <div className="overflow-x-auto" style={{ marginRight: '80px' }}>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers
                        .filter(header => (header.column.columnDef as any).id !== "actions")
                        .map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                            </TableHead>
                          )
                        })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells()
                          .filter(cell => (cell.column.columnDef as any).id !== "actions")
                          .map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={dataColumns.length} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Fixed action column */}
            <div 
              className="absolute top-0 right-0 h-full bg-background border-l shadow-lg z-10"
              style={{ width: '80px' }}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                      const actionCell = row.getVisibleCells().find(cell => (cell.column.columnDef as any).id === "actions")
                      return (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="text-center">
                            {actionCell && flexRender(actionCell.column.columnDef.cell, actionCell.getContext())}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell className="h-24"></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={finalColumns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}