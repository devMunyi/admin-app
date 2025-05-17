// src/components/temp-ui/form/Select.tsx
import React from "react";

type Option = {
  value: string;
  label: string;
};

type SelectProps = {
  options: Option[];
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  className?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: boolean;
  name?: string;
  ref?: React.Ref<HTMLSelectElement>;
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder = "Select an option",
      onChange,
      onBlur,
      className = "",
      value,
      defaultValue = "",
      disabled = false,
      error = false,
      name,
      ...props
    },
    ref
  ) => {
    return (
      <select
        ref={ref}
        className={`h-9.5 w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${value || defaultValue
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
          } ${error ? "border-error-500" : ""} ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 dark:bg-gray-800/60 dark:text-gray-500 dark:border-gray-700" : ""
          } ${className}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        name={name}
        {...props}
      >
        {/* Placeholder option */}
        <option
          value=""
          disabled={false}
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {placeholder}
        </option>
        {/* Map over options */}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = "Select";

export default Select;