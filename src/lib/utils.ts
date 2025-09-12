import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// URL validation utilities
export const urlValidation = {
  pattern: {
    value: /^https?:\/\/.+/,
    message: 'Please enter a valid URL (starting with http:// or https://)'
  }
}

// More comprehensive URL validation for stricter validation
export const strictUrlValidation = {
  pattern: {
    value: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    message: 'Please enter a valid URL (e.g., https://www.example.com)'
  }
}
