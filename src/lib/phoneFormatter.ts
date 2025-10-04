/**
 * Formats a phone number to (XXX) XXX-XXXX format
 * @param phoneNumber - The phone number to format (can be in various formats)
 * @param extension - Optional extension to append
 * @returns Formatted phone number in (XXX) XXX-XXXX format, or original string if invalid
 */
export const formatPhoneNumber = (phoneNumber: string | null | undefined, extension?: string | null | undefined): string => {
  if (!phoneNumber) return '';
  
  // Check if already formatted (contains parentheses and dash)
  if (phoneNumber.includes('(') && phoneNumber.includes(')') && phoneNumber.includes('-')) {
    // Already formatted, just add extension if needed
    if (extension && extension.trim()) {
      return `${phoneNumber} ext. ${extension.trim()}`;
    }
    return phoneNumber;
  }
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  let formattedNumber = '';
  
  // Handle different phone number lengths
  if (digits.length === 10) {
    // US format: (XXX) XXX-XXXX
    formattedNumber = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // US format with country code: 1XXXXXXXXXX -> (XXX) XXX-XXXX
    formattedNumber = `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 11 && digits.startsWith('+1')) {
    // Handle +1 prefix
    const cleanDigits = digits.slice(1);
    formattedNumber = `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6)}`;
  } else {
    // Return original if we can't format it
    return phoneNumber;
  }
  
  // Add extension if provided
  if (extension && extension.trim()) {
    formattedNumber += ` ext. ${extension.trim()}`;
  }
  
  return formattedNumber;
};

/**
 * Formats a phone number for input fields (removes formatting)
 * @param phoneNumber - The formatted phone number
 * @returns Clean phone number with only digits
 */
export const cleanPhoneNumber = (phoneNumber: string | null | undefined): string => {
  if (!phoneNumber) return '';
  return phoneNumber.replace(/\D/g, '');
};

/**
 * Formats a work phone number with extension
 * @param phoneNumber - The work phone number to format
 * @param extension - The extension number
 * @returns Formatted work phone with extension
 */
export const formatWorkPhone = (phoneNumber: string | null | undefined, extension?: string | null | undefined): string => {
  return formatPhoneNumber(phoneNumber, extension);
};

/**
 * Formats a cell phone number (no extension)
 * @param phoneNumber - The cell phone number to format
 * @returns Formatted cell phone number
 */
export const formatCellPhone = (phoneNumber: string | null | undefined): string => {
  return formatPhoneNumber(phoneNumber);
};

/**
 * Auto-formats phone number as user types
 * @param value - The input value from the user
 * @returns Formatted phone number string
 */
export const autoFormatPhoneNumber = (value: string): string => {
  // If value is empty, return empty string
  if (!value) return '';
  
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // If no digits, return empty string
  if (!digits) return '';
  
  // Handle country code (1 at the beginning)
  let phoneDigits = digits;
  if (digits.length === 11 && digits.startsWith('1')) {
    phoneDigits = digits.slice(1);
  } else if (digits.length > 10) {
    phoneDigits = digits.slice(0, 10);
  }
  
  // Format based on length
  if (phoneDigits.length <= 3) {
    return `(${phoneDigits}`;
  } else if (phoneDigits.length <= 6) {
    return `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3)}`;
  } else {
    return `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6)}`;
  }
};

/**
 * Validates if a phone number is in a valid format
 * @param phoneNumber - The phone number to validate
 * @returns true if valid, false otherwise
 */
export const isValidPhoneNumber = (phoneNumber: string | null | undefined): boolean => {
  if (!phoneNumber) return false;
  
  const digits = phoneNumber.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
};
