import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

/**
 * Helper function to create a column definition with proper meta title for column toggle
 * This ensures consistent display names in the column toggle dropdown across all pages
 */
export function createColumnWithTitle<TData>(
  columnDef: ColumnDef<TData>,
  title: string
): ColumnDef<TData> {
  return {
    ...columnDef,
    meta: {
      ...columnDef.meta,
      title,
    },
  };
}

/**
 * Helper function to create a simple column with just accessorKey and title
 */
export function createSimpleColumn<TData>(
  accessorKey: keyof TData,
  title: string,
  options?: Partial<ColumnDef<TData>>
): ColumnDef<TData> {
  return createColumnWithTitle(
    {
      accessorKey: accessorKey as string,
      header: title,
      ...options,
    },
    title
  );
}

/**
 * Helper function to create a column with DataTableColumnHeader
 */
export function createSortableColumn<TData>(
  accessorKey: keyof TData,
  title: string,
  options?: Partial<ColumnDef<TData>>
): ColumnDef<TData> {
  return createColumnWithTitle(
    {
      accessorKey: accessorKey as string,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={title} />
      ),
      ...options,
    },
    title
  );
}
