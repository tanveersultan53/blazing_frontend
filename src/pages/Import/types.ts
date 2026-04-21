// Import feature types and interfaces

export type ImportType = 'contact' | 'partner';
export type ImportStatus = 'prospect' | 'client';
export type ImportAction = 'add' | 'update' | 'skip';

export interface ImportTemplate {
  id?: number;
  template_name: string;
  import_type: ImportType;
  import_status: ImportStatus;
  import_file?: File | null;

  // Import options
  add_optout: boolean;
  email_only: boolean;
  force_add: boolean;
  dont_contact: boolean;

  // Name parsing options
  fixname1: boolean;
  fixname2: boolean;
  fixname3: boolean;

  // Address parsing options
  fixaddress1: boolean;
  fixaddress2: boolean;
  fixaddress3: boolean;

  field_mappings?: FieldMapping[];
}

export interface FieldMapping {
  import_field: string;
  blazing_field: string;
}

export interface ImportPreviewRow {
  row_number: number;
  action: ImportAction;
  data: Record<string, any>;
  has_empty_email: boolean;
  existing_contact_id?: number | null;
  selected: boolean;
}

// BlazingSocial field definitions
export const CONTACT_FIELDS = [
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'secondary_first_name', label: 'Second First Name' },
  { value: 'secondary_last_name', label: 'Second Last Name' },
  { value: 'secondary_email', label: 'Second Email' },
  { value: 'secondary_birthday', label: 'Second Birthday' },
  { value: 'address', label: 'Address' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'zip_code', label: 'Zip' },
  { value: 'cell', label: 'Cell Phone' },
  { value: 'work_phone', label: 'Work Phone' },
  { value: 'group', label: 'Group' },
  { value: 'status', label: 'Status' },
  { value: 'loan_program', label: 'Loan Program' },
  { value: 'loan_amount', label: 'Loan Amount' },
  { value: 'close_date', label: 'Close Date' },
  { value: 'interest_rate', label: 'Interest Rate' },
  { value: 'sales_price', label: 'Sales Price' },
  { value: 'loan_type', label: 'Loan Type' },
  { value: 'property_type', label: 'Property Type' },
] as const;

export const PARTNER_FIELDS = [
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'company', label: 'Company' },
  { value: 'title', label: 'Title' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'address', label: 'Address' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'zip_code', label: 'Zip' },
  { value: 'cell', label: 'Cell Phone' },
  { value: 'work_phone', label: 'Work Phone' },
  { value: 'group', label: 'Group' },
  { value: 'status', label: 'Status' },
] as const;
