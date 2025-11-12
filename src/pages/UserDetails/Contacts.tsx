import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getContacts, type ContactFilters } from "@/services/contactService";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/helpers/constants";
import type { PersonData } from "../UserDashboard/useUserDashboard";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { formatCellPhone, formatWorkPhone } from "@/lib/phoneFormatter";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/Loading";
import { UserDashboardTable } from "../UserDashboard/UserDashboardTable";
import { useNavigate, useParams } from "react-router-dom";

const Contacts = ({
    tab,
}: {
    tab: 'contact' | 'referal_partner';

}) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const activeTab = tab as 'contact' | 'referal_partner';
    const [debouncedFilters, setDebouncedFilters] = useState<ContactFilters>({});
    const [debouncedGlobalSearch, setDebouncedGlobalSearch] = useState<string>("");
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const globalSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [filters, setFilters] = useState<ContactFilters>({});
    const [globalSearch, setGlobalSearch] = useState<string>("");

    // Debounce filters to prevent too many API calls
    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 500);

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [filters]);

    // Debounce global search to prevent too many API calls
    useEffect(() => {
        if (globalSearchTimeoutRef.current) {
            clearTimeout(globalSearchTimeoutRef.current);
        }

        globalSearchTimeoutRef.current = setTimeout(() => {
            setDebouncedGlobalSearch(globalSearch);
        }, 500);

        return () => {
            if (globalSearchTimeoutRef.current) {
                clearTimeout(globalSearchTimeoutRef.current);
            }
        };
    }, [globalSearch]);

    const { data: contacts, isLoading, isFetching } = useQuery({
        queryKey: [queryKeys.contacts, activeTab, id, JSON.stringify(debouncedFilters), debouncedGlobalSearch],
        queryFn: () => {
            // Map tab values to customer_type values
            let customerType = undefined;
            if (activeTab === 'contact') {
                customerType = 'contact';
            } else if (activeTab === 'referal_partner') {
                customerType = 'partner';
            }
            return getContacts({
                customer_type: customerType,
                ...debouncedFilters,
                search: debouncedGlobalSearch || undefined,
                user_id: id as string | number,
            });
        },
        staleTime: 30000, // Consider data fresh for 30 seconds
    });

    // Define columns based on the AddPerson form fields
    const columns: ColumnDef<PersonData>[] = useMemo(() => {
        const baseColumns: ColumnDef<PersonData>[] = [
            {
                id: "name",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Name" />
                ),
                accessorFn: (row) => `${row.first_name} ${row.last_name}`,
                enableColumnFilter: true,
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: ({ row }) => <div className="text-blue-600">{row.getValue("email")}</div>,
                enableColumnFilter: true,
            },
            {
                accessorKey: "cell",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Cell Phone" />
                ),
                cell: ({ row }) => {
                    const phoneNumber = row.getValue("cell") as string;
                    return <div className="text-sm">{formatCellPhone(phoneNumber)}</div>;
                },
                enableColumnFilter: true,
            },
            {
                accessorKey: "work_phone",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Work Phone" />
                ),
                cell: ({ row }) => {
                    const phoneNumber = row.getValue("work_phone") as string;
                    const extension = row.original.work_ext;
                    return <div className="text-sm">{formatWorkPhone(phoneNumber, extension)}</div>;
                },
                enableColumnFilter: true,
            },
        ];

        // Add company and title columns only when activeTab is 'all' or 'referal_partner'
        if (activeTab === 'referal_partner') {
            baseColumns.push(
                {
                    accessorKey: "company",
                    header: ({ column }) => (
                        <DataTableColumnHeader column={column} title="Company" />
                    ),
                    enableColumnFilter: true,
                },
                {
                    accessorKey: "title",
                    header: ({ column }) => (
                        <DataTableColumnHeader column={column} title="Title" />
                    ),
                    enableColumnFilter: true,
                }
            );
        }

        // Add remaining columns
        baseColumns.push(
            {
                header: 'Status',
                accessorKey: 'send_status',
                cell: ({ row }) => {
                    const sendStatus = row.getValue("send_status") as string;
                    const variant = sendStatus === "send" ? "default" : "destructive";
                    const displayText = sendStatus === "send" ? "Send" : "Don't Send";
                    return (
                        <Badge variant={variant}>
                            {displayText}
                        </Badge>
                    );
                },
                enableColumnFilter: true,
            },
            {
                header: 'Created',
                accessorKey: 'created',
                cell: ({ row }) => {
                    const date = new Date(row.getValue("created"));
                    return <div >{date.toLocaleDateString()}</div>;
                },
                enableColumnFilter: true,
            },
            {
                header: 'Modified',
                accessorKey: 'modified',
                cell: ({ row }) => {
                    const date = new Date(row.getValue("modified"));
                    return <div>{date.toLocaleDateString()}</div>;
                },
                enableColumnFilter: true,
            }
        );

        return baseColumns;
    }, [activeTab]);

    // Global search functions
    const updateGlobalSearch = useCallback((value: string) => {
        setGlobalSearch(value);
    }, []);

    const handleViewDetails = (row: PersonData) => {
        // Navigate to the contact details page with the contact ID
        navigate(`/contacts/${row.id}`);
    };

    // Column titles mapping for filter placeholders
    const columnTitles = {
        'name': 'Name',
        'email': 'Email',
        'cell': 'Cell Phone',
        'work_phone': 'Work Phone',
        'company': 'Company',
        'title': 'Title',
        'send_status': 'Status',
        'created': 'Created Date',
        'modified': 'Modified Date',
    };

    // Filter update function
    const updateFilter = useCallback((key: keyof ContactFilters, value: string) => {
        setFilters(prev => {
            const newFilters = { ...prev };

            if (value && value.trim() !== '') {
                newFilters[key] = value;
            } else {
                delete newFilters[key];
            }

            return newFilters;
        });
    }, []);

    const clearFilter = (key: keyof ContactFilters) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[key];
            return newFilters;
        });
    };

    const clearAllFilters = () => {
        setFilters({});
        setGlobalSearch("");
    };

    if (isLoading) {
        return <Loading />;
    }


    return (
        <Card className="mb-12">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle>{tab === 'contact' ? 'Contact List' : 'Referal Partner List'}</CardTitle>
                    <CardDescription>Following are the {tab === 'contact' ? 'contact' : 'referal partner'} list add by this user. </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <UserDashboardTable
                    columns={columns}
                    data={contacts?.data?.results || []}
                    searchColumns={['name', 'email', 'company', 'title', 'cell', 'work_phone']}
                    showActionsColumn={true}
                    onViewDetails={handleViewDetails}
                    actionItems={[]}
                    filters={filters as Record<string, string | undefined>}
                    onFilterChange={(key: string, value: string) => updateFilter(key as keyof typeof filters, value)}
                    onClearFilter={(key: string) => clearFilter(key as keyof typeof filters)}
                    onClearAllFilters={clearAllFilters}
                    columnTitles={columnTitles}
                    isFetching={isFetching}
                    isLoading={isLoading}
                    globalSearch={globalSearch}
                    onGlobalSearchChange={updateGlobalSearch}
                    enableRowSelection={true}
                    onDeleteSelected={() => { }}
                    onSendEmailSelected={() => { }}
                />
            </CardContent>
        </Card>
    )
}

export default Contacts;