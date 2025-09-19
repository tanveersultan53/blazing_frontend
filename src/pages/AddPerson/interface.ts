export interface AddPersonFormData {
  // Primary Contact
  first_name: string;
  last_name: string;
  title: string;
  company: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  cellphone: string;
  work_phone: string;
  birthday: string;
  age: string;
  group: string;
  status: string;
  optout: string;
  newsletter_version: string;
  
  // Secondary Contact
  spouse_first: string;
  spouse_last: string;
  spouse_email: string;
  sbirthday: string;
  sage: string;
  
  // Notes
  notes: string;
}

export interface AddPersonHookReturn {
  form: any; // React Hook Form instance
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
}
