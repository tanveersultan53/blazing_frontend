export interface IEcard {
  id?: number;
  email_name: string;
  email_subject: string;
  email_type: 'email' | 'ecard';
  ecard_date?: string;
  email_category: number;
  ecard_image?: File | string | null;
  ecard_text?: string;
  email_html?: string;
  email_preheader?: string;
  custom_email: boolean;
  created?: string;
  modified?: string;
}

export interface EcardResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IEcard[];
}

export const EMAIL_CATEGORIES = [
  { value: 0, label: 'Normal Email' },
  { value: 1, label: 'Birthday' },
  { value: 2, label: 'New Years' },
  { value: 3, label: "St. Patrick's Day" },
  { value: 4, label: '4th of July' },
  { value: 5, label: 'Halloween' },
  { value: 8, label: 'Summer' },
  { value: 9, label: 'Thanksgiving' },
  { value: 11, label: 'Veterans Day' },
  { value: 12, label: 'Spring' },
  { value: 13, label: 'Labor Day' },
  { value: 14, label: 'December Holidays' },
  { value: 15, label: 'Fall' },
  { value: 16, label: 'Valentines Day' },
  { value: 17, label: 'Memorial Day' },
];

export const EMAIL_TYPE_ECARD = 25;
export const EMAIL_TYPE_NORMAL = 0;
