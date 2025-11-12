import React from "react";
import { DataTable } from "@/components/data-table";
import { type ColumnDef } from "@tanstack/react-table";

interface ActionItem<TData> {
  label: string;
  onClick: (row: TData) => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string | ((row: TData) => string);
  disabled?: boolean | ((row: TData) => boolean);
}

interface UserDashboardTableProps<TData> {
  // DataTable props
  columns: ColumnDef<TData, any>[];
  data: TData[];
  searchColumns?: string[];
  showActionsColumn?: boolean;
  onViewDetails?: (row: TData) => void;
  actionItems?: ActionItem<TData>[];
  filters?: Record<string, string | undefined>;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilter?: (key: string) => void;
  onClearAllFilters?: () => void;
  columnTitles?: Record<string, string>;
  isFetching?: boolean;
  isLoading?: boolean;
  globalSearch?: string;
  onGlobalSearchChange?: (value: string) => void;
  enableRowSelection?: boolean;
  onDeleteSelected?: (rows: TData[]) => void;
  onSendEmailSelected?: (rows: TData[]) => void;
}

export function UserDashboardTable<TData>({
  columns,
  data,
  searchColumns = [],
  showActionsColumn = true,
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
}: UserDashboardTableProps<TData>) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumns={searchColumns}
      showActionsColumn={showActionsColumn}
      onViewDetails={onViewDetails}
      actionItems={actionItems}
      filters={filters}
      onFilterChange={onFilterChange}
      onClearFilter={onClearFilter}
      onClearAllFilters={onClearAllFilters}
      columnTitles={columnTitles}
      isFetching={isFetching}
      isLoading={isLoading}
      globalSearch={globalSearch}
      onGlobalSearchChange={onGlobalSearchChange}
      enableRowSelection={enableRowSelection}
      onDeleteSelected={onDeleteSelected}
      onSendEmailSelected={onSendEmailSelected}
    />
  );
}

