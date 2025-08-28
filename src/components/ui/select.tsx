import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

export function Select({ value, placeholder, id, 'aria-labelledby': ariaLabelledby, children }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={triggerRef}>
      <div
        id={id}
        aria-labelledby={ariaLabelledby}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={handleTriggerClick}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        <span className={cn("block truncate", !selectedValue && "text-muted-foreground")}>
          {selectedValue || placeholder}
        </span>
        <ChevronDownIcon className="h-4 w-4 opacity-50" />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          <div role="listbox" className="p-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function SelectTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectItem({ children }: { value: string; children: React.ReactNode }) {
  return (
    <div
      role="option"
      className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
    >
      {children}
    </div>
  );
}

export function SelectValue({ placeholder, children }: { placeholder?: string; children?: React.ReactNode }) {
  return (
    <span className={cn("block truncate", !children && "text-muted-foreground")}>
      {children || placeholder}
    </span>
  );
} 