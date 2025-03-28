'use client';

import { forwardRef } from 'react';
import {
  Select as OriginalSelect,
  SelectContent as OriginalSelectContent,
  SelectItem as OriginalSelectItem,
  SelectTrigger as OriginalSelectTrigger,
  SelectValue as OriginalSelectValue,
  SelectGroup as OriginalSelectGroup,
  SelectLabel as OriginalSelectLabel,
  SelectSeparator as OriginalSelectSeparator
} from '@/components/ui/select';

// SelectItem personalizado que nunca acepta valores vacíos
const SelectItem = forwardRef(({ value, children, ...props }, ref) => {
  // Si el valor es vacío, reemplazarlo con un valor seguro
  const safeValue = value === '' ? 'empty_value' : value;
  
  return (
    <OriginalSelectItem ref={ref} value={safeValue} {...props}>
      {children}
    </OriginalSelectItem>
  );
});

SelectItem.displayName = 'SafeSelectItem';

// Re-exportamos los componentes originales junto con nuestro SelectItem personalizado
const Select = OriginalSelect;
const SelectContent = OriginalSelectContent;
const SelectTrigger = OriginalSelectTrigger;
const SelectValue = OriginalSelectValue;
const SelectGroup = OriginalSelectGroup;
const SelectLabel = OriginalSelectLabel;
const SelectSeparator = OriginalSelectSeparator;

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
}; 