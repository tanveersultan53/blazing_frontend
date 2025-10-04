import { useState, useCallback } from 'react';
import { autoFormatPhoneNumber } from '@/lib/phoneFormatter';

export const usePhoneInput = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = autoFormatPhoneNumber(inputValue);
    setValue(formattedValue);
    
    // Create a new event with the formatted value for React Hook Form
    const formattedEvent = {
      ...e,
      target: {
        ...e.target,
        value: formattedValue
      }
    };
    
    return formattedEvent;
  }, []);

  return {
    value,
    setValue,
    handleChange
  };
};
