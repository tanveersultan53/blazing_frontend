export interface AddPersonFormData {
  // Primary Contact
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  cell: string;
  work_phone: string;
  birthday: string;
  age: string;
  group: string;
  send_status: string;
  optout: string;
  newsletter_version: string;
  
  // Secondary Contact
  secondary_first_name: string;
  secondary_last_name: string;
  secondary_email: string;
  secondary_birthday: string;
  secondary_age: string;
  
  // Notes
  notes: string;

  // Type
  customer_type?: string;

  //Loan Information
  loan_status: string;
  interest_rate: string;
  sales_price: string;
  loan_amount: string;
  percent_down: string;
  ltv: string;
  close_date: string;
  loan_program: string;
  loan_type: string;
  property_type: string;
}

export interface AddPersonHookReturn {
  form: any; // React Hook Form instance
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
}
