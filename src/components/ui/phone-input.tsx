import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { autoFormatPhoneNumber } from '@/lib/phoneFormatter';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(value);

    // Update display value when external value changes
    useEffect(() => {
      setDisplayValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formattedValue = autoFormatPhoneNumber(inputValue);
      
      setDisplayValue(formattedValue);
      
      // Create a new event with the formatted value
      const formattedEvent = {
        ...e,
        target: {
          ...e.target,
          value: formattedValue
        }
      };
      
      if (onChange) {
        onChange(formattedEvent);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder="(858) 369-5555"
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
