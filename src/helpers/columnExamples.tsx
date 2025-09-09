import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { createColumnWithTitle, createSimpleColumn, createSortableColumn } from "./columnHelpers";

// Example interface for a hypothetical "Products" page
interface IProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  in_stock: boolean;
  created_at: string;
}

// Example of how to create columns for a new page using the helper functions
export const createProductColumns = (): ColumnDef<IProduct>[] => [
  // Simple column with just accessorKey and title
  createSimpleColumn("id", "Product ID"),
  
  // Sortable column with DataTableColumnHeader
  createSortableColumn("name", "Product Name"),
  
  // Sortable column with custom cell rendering
  createSortableColumn("price", "Price", {
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return `$${price.toFixed(2)}`;
    },
  }),
  
  // Simple column for category
  createSimpleColumn("category", "Category"),
  
  // Column with custom rendering and meta title
  createColumnWithTitle(
    {
      accessorKey: "in_stock",
      header: "Availability",
      cell: ({ row }) => {
        const inStock = row.getValue("in_stock") as boolean;
        return (
          <Badge variant={inStock ? "default" : "secondary"}>
            {inStock ? "In Stock" : "Out of Stock"}
          </Badge>
        );
      },
    },
    "Availability"
  ),
  
  // Column with custom ID and accessorFn
  createColumnWithTitle(
    {
      id: "formatted_date",
      header: "Created Date",
      accessorFn: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    "Created Date"
  ),
];

// Example of how to create columns without helper functions (not recommended)
export const createProductColumnsWithoutHelpers = (): ColumnDef<IProduct>[] => [
  {
    accessorKey: "name",
    header: "Product Name",
    meta: { title: "Product Name" }, // This is required for proper column toggle display
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return `$${price.toFixed(2)}`;
    },
    meta: { title: "Price" }, // This is required for proper column toggle display
  },
  // ... other columns
];
