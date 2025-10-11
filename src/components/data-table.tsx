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
import { MoreHorizontal, X, Mail, Trash2 } from "lucide-react"
import { Checkbox } from "./ui/checkbox"

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
  // Server-side filtering props
  filters?: Record<string, string | undefined>
  onFilterChange?: (key: string, value: string) => void
  onClearFilter?: (key: string) => void
  onClearAllFilters?: () => void
  columnTitles?: Record<string, string>
  isFetching?: boolean
  isLoading?: boolean
  // Global search props
  globalSearch?: string
  onGlobalSearchChange?: (value: string) => void
  // Row selection props
  enableRowSelection?: boolean
  onDeleteSelected?: (rows: TData[]) => void
  onSendEmailSelected?: (rows: TData[]) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumns = [],
  showActionsColumn = false,
  onViewDetails,
  actionItems = [],
  filters = {},
  onFilterChange,
  onClearFilter,
  onClearAllFilters,
  columnTitles = {},
  isFetching = false,
  isLoading = false,
  globalSearch = "",
  onGlobalSearchChange,
  enableRowSelection = false,
  onDeleteSelected,
  onSendEmailSelected,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState({})

  const finalColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    const columnsWithExtras: ColumnDef<TData, TValue>[] = []

    // Add checkbox column if row selection is enabled
    if (enableRowSelection) {
      const selectColumn: ColumnDef<TData, TValue> = {
        id: "select" as any,
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ) as any,
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ) as any,
        enableSorting: false,
        enableHiding: false,
        enableColumnFilter: false,
      }
      columnsWithExtras.push(selectColumn)
    }

    // Add user-defined columns
    columnsWithExtras.push(...columns)

    // Add actions column if needed
    if (showActionsColumn) {
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
      columnsWithExtras.push(actionsColumn)
    }

    return columnsWithExtras
  }, [columns, showActionsColumn, actionItems, onViewDetails, enableRowSelection])

  const table = useReactTable({
    data,
    columns: finalColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    // Disable client-side filtering when using server-side filtering
    getFilteredRowModel: onFilterChange ? undefined : getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableRowSelection,
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
      rowSelection,
    },
  })

  // Get selected rows
  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
  const hasSelection = selectedRows.length > 0


  return (
    <div>
      <div className="flex items-center py-4 gap-2 justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder={`Search`}
            value={onGlobalSearchChange ? globalSearch : (globalFilter ?? "")}
            onChange={(event) => {
              if (onGlobalSearchChange) {
                onGlobalSearchChange(event.target.value);
              } else {
                setGlobalFilter(event.target.value);
              }
            }}
            className="max-w-sm"
          />
          {onClearAllFilters && (Object.keys(filters).some(key => filters[key]) || globalSearch) && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAllFilters}
              className="h-8 gap-1"
            >
              <X className="h-3 w-3" />
              Clear All
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 justify-end">
          {/* Row selection action buttons */}
          {enableRowSelection && hasSelection && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteSelected?.(selectedRows)}
                className="h-9 gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedRows.length})
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onSendEmailSelected?.(selectedRows)}
                className="h-9 gap-2"
              >
                <Mail className="h-4 w-4" />
                Send Email ({selectedRows.length})
              </Button>
            </>
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <div className="rounded-md border">
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
              {/* Filter Row */}
              <TableRow>
                {table.getHeaderGroups()[0]?.headers.map((header) => {
                  const column = header.column;
                  const columnId = column.id;
                  const filterValue = filters[columnId] || "";

                  // Get proper column title for placeholder
                  const getColumnTitle = (columnId: string) => {
                    // Use provided column titles mapping first
                    if (columnTitles[columnId]) {
                      return columnTitles[columnId];
                    }

                    // Fallback: convert column id to readable format
                    return columnId
                      .split('_')
                      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
                  };

                  return (
                    <TableHead key={`filter-${header.id}`} className="p-2">
                      {column.getCanFilter() && onFilterChange ? (
                        <div className="relative">
                          <Input
                            placeholder={`${getColumnTitle(columnId)}...`}
                            value={filterValue}
                            onChange={(event) => onFilterChange(columnId, event.target.value)}
                            className="h-8 text-xs pr-8"
                          />
                          {filterValue && onClearFilter && (
                            <button
                              type="button"
                              onClick={() => onClearFilter(columnId)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ) : null}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isLoading || isFetching) ? (
                <TableRow>
                  <TableCell colSpan={finalColumns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
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
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}