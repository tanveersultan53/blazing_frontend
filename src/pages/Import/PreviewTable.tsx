import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ImportPreviewRow, ImportAction } from './types';

interface PreviewTableProps {
    data: ImportPreviewRow[];
    onImport: (selectedRows: ImportPreviewRow[]) => void;
}

const PreviewTable = ({ data, onImport }: PreviewTableProps) => {
    const [rows, setRows] = useState<ImportPreviewRow[]>(data);
    const [filter, setFilter] = useState<'all' | 'add' | 'update' | 'remove-empty'>('all');
    const [selectAll, setSelectAll] = useState(true);

    const filteredRows = rows.filter(row => {
        if (filter === 'all') return true;
        if (filter === 'add') return row.action === 'add';
        if (filter === 'update') return row.action === 'update';
        if (filter === 'remove-empty') return row.has_empty_email;
        return true;
    });

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        setRows(rows.map(row => ({ ...row, selected: checked })));
    };

    const handleSelectRow = (rowNumber: number, checked: boolean) => {
        setRows(rows.map(row =>
            row.row_number === rowNumber ? { ...row, selected: checked } : row
        ));
    };

    const handleFilterChange = (newFilter: typeof filter) => {
        setFilter(newFilter);

        if (newFilter === 'remove-empty') {
            // Deselect rows with empty emails
            setRows(rows.map(row =>
                row.has_empty_email ? { ...row, selected: false } : row
            ));
        }
    };

    const selectedCount = rows.filter(r => r.selected).length;
    const addCount = rows.filter(r => r.action === 'add').length;
    const updateCount = rows.filter(r => r.action === 'update').length;

    const handleImport = () => {
        const selectedRows = rows.filter(r => r.selected);
        onImport(selectedRows);
    };

    const getActionBadge = (action: ImportAction) => {
        switch (action) {
            case 'add':
                return <Badge variant="default">Add</Badge>;
            case 'update':
                return <Badge variant="secondary">Update</Badge>;
            case 'skip':
                return <Badge variant="outline">Skip</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Import Preview</CardTitle>
                <CardDescription>
                    Review and select records to import. {selectedCount} of {rows.length} selected
                    ({addCount} new, {updateCount} updates)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filter Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="select-all"
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                        />
                        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                            Select All
                        </label>
                    </div>

                    <Select value={filter} onValueChange={(value) => handleFilterChange(value as typeof filter)}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Records</SelectItem>
                            <SelectItem value="add">Add Only</SelectItem>
                            <SelectItem value="update">Update Only</SelectItem>
                            <SelectItem value="remove-empty">Remove Empty Emails</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Preview Table */}
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">Select</TableHead>
                                <TableHead className="w-16">#</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>First Name</TableHead>
                                <TableHead>Last Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                        No records match the current filter
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRows.map(row => (
                                    <TableRow key={row.row_number}>
                                        <TableCell>
                                            <Checkbox
                                                checked={row.selected}
                                                onCheckedChange={(checked) =>
                                                    handleSelectRow(row.row_number, checked as boolean)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>{row.row_number}</TableCell>
                                        <TableCell>{getActionBadge(row.action)}</TableCell>
                                        <TableCell>{row.data.first_name || '-'}</TableCell>
                                        <TableCell>{row.data.last_name || '-'}</TableCell>
                                        <TableCell>
                                            {row.data.email || (
                                                <span className="text-red-500 text-xs">Empty</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{row.data.cell || row.data.work_phone || '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Import Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleImport}
                        disabled={selectedCount === 0}
                    >
                        Import {selectedCount} Record{selectedCount !== 1 ? 's' : ''}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default PreviewTable;
