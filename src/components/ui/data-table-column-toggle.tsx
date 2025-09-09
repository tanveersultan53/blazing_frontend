import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { type Table } from "@tanstack/react-table"
import { Settings2 } from "lucide-react"

import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./dropdown-menu"

/**
 * DataTableViewOptions component for toggling column visibility
 * 
 * This component dynamically extracts column titles from:
 * 1. column.columnDef.meta.title (recommended approach for consistency)
 * 2. column.columnDef.header (if it's a string)
 * 3. Human-readable version of column.id (fallback)
 * 
 * For best results, use the helper functions in @/helpers/columnHelpers.tsx
 * to create columns with proper meta.title properties.
 */
export function DataTableViewOptions<TData>({
  table,
}: {
  table: Table<TData>
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Settings2 />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            // Extract the header title from the column definition
            const getColumnTitle = (column: any) => {
              // First priority: Check if there's a meta property with title
              if (column.columnDef.meta?.title) {
                return column.columnDef.meta.title;
              }
              
              // Second priority: If header is a string, use it directly
              const header = column.columnDef.header;
              if (typeof header === 'string') {
                return header;
              }
              
              // Fallback: Convert column id to human-readable format
              return column.id
                .split('_')
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            };

            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {getColumnTitle(column)}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
