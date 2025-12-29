import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Mail, Send } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCustomerEmailTemplates, sendEmail } from "@/services/emailService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/data-table";
import { getContacts, type ContactFilters } from "@/services/contactService";
import { queryKeys } from "@/helpers/constants";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { formatCellPhone, formatWorkPhone } from "@/lib/phoneFormatter";

interface PersonData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  company: string;
  customer_type: string;
  send_status: string;
  newsletter_version: string;
  status: string;
  optout: boolean;
  created: string;
  modified: string;
  cell: string;
  work_phone: string;
  work_ext: string;
}

export default function SendEmailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templateId || ""
  );
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<PersonData[]>([]);
  const [filters, setFilters] = useState<ContactFilters>({});
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [debouncedFilters, setDebouncedFilters] = useState<ContactFilters>({});
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] =
    useState<string>("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const globalSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Fetch all customer templates
  const { data: templatesData, isLoading: loadingTemplates } = useQuery({
    queryKey: ["customer-email-templates"],
    queryFn: () => getCustomerEmailTemplates({ is_active: true }),
  });

  const templates = Array.isArray(templatesData?.data)
    ? templatesData.data
    : templatesData?.data?.results || [];

  // Fetch contacts
  const {
    data: contactsData,
    isLoading: loadingContacts,
    isFetching,
  } = useQuery({
    queryKey: [
      queryKeys.contacts,
      "all",
      JSON.stringify(debouncedFilters),
      debouncedGlobalSearch,
    ],
    queryFn: () => {
      return getContacts({
        ...debouncedFilters,
        search: debouncedGlobalSearch || undefined,
      });
    },
    staleTime: 30000,
  });

  const contacts = contactsData?.data?.results || [];

  // Define columns for the contacts table
  const columns: ColumnDef<PersonData>[] = useMemo(() => {
    return [
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
        cell: ({ row }) => (
          <div className="text-blue-600">{row.getValue("email")}</div>
        ),
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
          return (
            <div className="text-sm">
              {formatWorkPhone(phoneNumber, extension)}
            </div>
          );
        },
        enableColumnFilter: true,
      },
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
      },
      {
        header: "Status",
        accessorKey: "send_status",
        cell: ({ row }) => {
          const sendStatus = row.getValue("send_status") as string;
          const variant = sendStatus === "send" ? "default" : "destructive";
          const displayText = sendStatus === "send" ? "Send" : "Don't Send";
          return <Badge variant={variant}>{displayText}</Badge>;
        },
        enableColumnFilter: true,
      },
      {
        header: "Created",
        accessorKey: "created",
        cell: ({ row }) => {
          const date = new Date(row.getValue("created"));
          return <div>{date.toLocaleDateString()}</div>;
        },
        enableColumnFilter: true,
      },
      {
        header: "Modified",
        accessorKey: "modified",
        cell: ({ row }) => {
          const date = new Date(row.getValue("modified"));
          return <div>{date.toLocaleDateString()}</div>;
        },
        enableColumnFilter: true,
      },
    ];
  }, []);

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: (data: {
      template_id: number;
      recipient_type: "contacts" | "partners" | "all" | "custom";
      custom_emails?: string[];
      include_attachments?: boolean;
    }) => sendEmail(data),
    onSuccess: (response) => {
      const message = response?.data?.message || "Email sent successfully";
      const count = response?.data?.recipients_count || 0;
      toast.success(`${message} (${count} recipient${count !== 1 ? "s" : ""})`);
      navigate("/my-email-templates");
    },
    onError: (error: any) => {
      console.error("Send email error:", error);
      toast.error(error.response?.data?.error || "Failed to send email");
    },
  });

  const handleSend = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select a template");
      return;
    }

    if (selectedContacts.length === 0) {
      toast.error("Please select at least one contact");
      return;
    }

    const selectedEmails = selectedContacts
      .map((c) => c.email)
      .filter((email) => email && email.trim() !== "");

    if (selectedEmails.length === 0) {
      toast.error("Selected contacts have no valid email addresses");
      return;
    }

    try {
      await sendEmailMutation.mutateAsync({
        template_id: Number(selectedTemplateId),
        recipient_type: "custom",
        custom_emails: selectedEmails,
        include_attachments: includeAttachments,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSendEmailSelected = (selectedRows: PersonData[]) => {
    setSelectedContacts(selectedRows);
  };

  const updateFilter = useCallback(
    (key: keyof ContactFilters, value: string) => {
      setFilters((prev) => {
        const newFilters = { ...prev };

        if (value && value.trim() !== "") {
          newFilters[key] = value;
        } else {
          delete newFilters[key];
        }

        return newFilters;
      });
    },
    []
  );

  const clearFilter = (key: keyof ContactFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setGlobalSearch("");
  };

  const updateGlobalSearch = useCallback((value: string) => {
    setGlobalSearch(value);
  }, []);

  const columnTitles = {
    name: "Name",
    email: "Email",
    cell: "Cell Phone",
    work_phone: "Work Phone",
    company: "Company",
    title: "Title",
    send_status: "Status",
    created: "Created Date",
    modified: "Modified Date",
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/my-email-templates">
              My Email Templates
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Send Email</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Mail className="w-8 h-8" />
              Send Email
            </h1>
            <p className="text-muted-foreground mt-1">
              Select a template and recipients to send
            </p>
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={
            sendEmailMutation.isPending || selectedContacts.length === 0
          }
          size="lg"
        >
          <Send className="w-4 h-4 mr-2" />
          {sendEmailMutation.isPending
            ? "Sending..."
            : `Send to ${selectedContacts.length} Contact${
                selectedContacts.length !== 1 ? "s" : ""
              }`}
        </Button>
      </div>

      {/* Template Selection and Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Select Email Template</CardTitle>
            <CardDescription>
              Choose the email template you want to send
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="template-select">Email Template</Label>
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger id="template-select">
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingTemplates ? (
                    <SelectItem value="loading" disabled>
                      Loading templates...
                    </SelectItem>
                  ) : templates.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No templates available
                    </SelectItem>
                  ) : (
                    templates.map((tmpl: any) => (
                      <SelectItem
                        key={tmpl.email_id}
                        value={String(tmpl.email_id)}
                      >
                        {tmpl.email_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {selectedTemplateId && templates.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md space-y-2">
                  <h3 className="font-semibold text-sm">Template Information</h3>
                  {(() => {
                    const selectedTemplate = templates.find(
                      (tmpl: any) => String(tmpl.email_id) === selectedTemplateId
                    );
                    return selectedTemplate ? (
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium">Name: </span>
                          <span className="text-gray-700">{selectedTemplate.email_name}</span>
                        </div>
                        {selectedTemplate.email_subject && (
                          <div>
                            <span className="font-medium">Subject: </span>
                            <span className="text-gray-700">{selectedTemplate.email_subject}</span>
                          </div>
                        )}
                        {selectedTemplate.email_from && (
                          <div>
                            <span className="font-medium">From: </span>
                            <span className="text-gray-700">{selectedTemplate.email_from}</span>
                          </div>
                        )}
                        {selectedTemplate.created && (
                          <div>
                            <span className="font-medium">Created: </span>
                            <span className="text-gray-700">
                              {new Date(selectedTemplate.created).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

            </div>
          </CardContent>
        </Card>

        {/* Options Card */}
        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
            <CardDescription>Configure email settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-attachments"
                checked={includeAttachments}
                onCheckedChange={(checked) =>
                  setIncludeAttachments(checked as boolean)
                }
              />
              <Label
                htmlFor="include-attachments"
                className="text-sm font-normal cursor-pointer"
              >
                Include attachments
              </Label>
            </div>
            {selectedContacts.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium">
                  {selectedContacts.length} contact
                  {selectedContacts.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Select Recipients</CardTitle>
          <CardDescription>
            Choose contacts to send the email to
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-6 pb-6">
            <DataTable
              columns={columns}
              data={contacts}
              searchColumns={[
                "name",
                "email",
                "company",
                "title",
                "cell",
                "work_phone",
              ]}
              showActionsColumn={false}
              filters={filters as Record<string, string | undefined>}
              onFilterChange={(key: string, value: string) =>
                updateFilter(key as keyof typeof filters, value)
              }
              onClearFilter={(key: string) =>
                clearFilter(key as keyof typeof filters)
              }
              onClearAllFilters={clearAllFilters}
              columnTitles={columnTitles}
              isFetching={isFetching}
              isLoading={loadingContacts}
              globalSearch={globalSearch}
              onGlobalSearchChange={updateGlobalSearch}
              enableRowSelection={true}
              onSendEmailSelected={handleSendEmailSelected}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
