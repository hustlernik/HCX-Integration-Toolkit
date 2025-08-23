import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './popover';
import { Button } from './button';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const summary =
    value.length === 0 ? (
      <span className="text-muted-foreground">{placeholder}</span>
    ) : (
      <span className="truncate block w-full text-left">
        {options
          .filter((opt) => value.includes(opt.value))
          .map((opt) => opt.label)
          .join(', ')}
      </span>
    );

  return (
    <div>
      {label && <label className="block mb-1">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="min-h-[40px] w-full justify-between truncate bg-muted hover:bg-muted"
            type="button"
            aria-haspopup="listbox"
          >
            {summary}
            <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[200px]">
          <ul className="max-h-60 overflow-y-auto py-2" tabIndex={-1} role="listbox">
            {options.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={value.includes(opt.value)}
                className={`flex items-center px-3 py-2 cursor-pointer select-none gap-2 ${value.includes(opt.value) ? 'font-semibold' : ''}`}
                onClick={() => handleSelect(opt.value)}
                style={{ background: 'none' }}
              >
                <input
                  type="checkbox"
                  checked={value.includes(opt.value)}
                  readOnly
                  tabIndex={-1}
                  className="accent-primary mr-2"
                />
                {opt.label}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
};
