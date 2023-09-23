import { FieldError } from 'react-hook-form';
import PhoneInput, { Value } from 'react-phone-number-input';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { forwardRef, ForwardRefRenderFunction, useCallback } from 'react';

import br from 'react-phone-number-input/locale/pt-BR.json';

interface PhoneNumberInputProps {
  name: string;
  phoneNumber: Value | undefined;
  setPhoneNumber: (value?: Value) => void;
  label?: string;
  error?: FieldError;
  backgroundColor?: string;
  hoverBackgroundColor?: string;
}

export default function PhoneNumberInput({
  name,
  phoneNumber,
  setPhoneNumber,
  label,
  error,
  backgroundColor,
  hoverBackgroundColor,
}: PhoneNumberInputProps) {
  return (
    <div id={`form-control-${name}`}>
      {!!label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium ${
            error ? 'text-red-600' : 'text-gray-700'
          }`}
        >
          {label}
        </label>
      )}
      <PhoneInput
        initialValueFormat="national"
        labels={br}
        countrySelectProps={{ unicodeFlags: true }}
        international
        countryCallingCodeEditable={false}
        defaultCountry="BR"
        value={phoneNumber}
        onChange={setPhoneNumber}
        inputComponent={PhoneInputForReactPhone}
        countrySelectComponent={SelectCountry}
        backgroundColor={backgroundColor}
        hoverBackgroundColor={hoverBackgroundColor}
        className="relative mt-2 rounded-md shadow-sm"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
    </div>
  );
}

interface InputProps {
  name: string;
  label?: string;
  type?: string;
  id?: string;
  htmlFor?: string;
  placeholder?: string;
  className?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
}

interface SelectProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  options: {
    value: string;
    label: string;
  }[];
}

const SelectBase: ForwardRefRenderFunction<HTMLSelectElement, SelectProps> = (
  { name, value, className, options, onChange, ...rest },
  ref
) => {
  const onChange_ = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      const value = event.target.value;
      onChange(value === 'ZZ' ? undefined : value);
    },
    [onChange]
  );

  return (
    <div className="absolute inset-y-0 left-0 flex max-w-[8rem] items-center">
      <label htmlFor="country" className="sr-only">
        Country
      </label>
      <select
        id="country"
        name={name}
        onChange={onChange_}
        value={value}
        className={`block h-full max-w-[8rem] truncate rounded-md border-0 bg-transparent px-3 py-0 text-gray-500 focus:outline-none sm:text-sm ${className}`}
        ref={ref}
        {...rest}
      >
        {options.map((option) => {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>

      {/* add a horizontal line */}
      <div className="absolute inset-y-0 left-[140px] flex items-center">
        <div className="h-[calc(100%-20%)] w-[1px] bg-gray-300" />
      </div>
    </div>
  );
};

const SelectCountry = forwardRef(SelectBase);

const InputBase: ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  {
    name,
    type,
    id,
    placeholder,
    className,
    helperText,
    errorMessage,
    required = false,
    ...rest
  },
  ref
) => {
  return (
    <>
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        className={`block w-full appearance-none rounded-md border border-gray-300 py-2 pl-36 placeholder-gray-400 shadow-sm sm:text-sm ${className} ${
          errorMessage
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
            : 'focus:border-brand-purple-900 focus:ring-brand-purple-900'
        }`}
        name={name}
        ref={ref}
        {...rest}
      />
      {errorMessage && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ExclamationCircleIcon
            className="h-5 w-5 text-red-500"
            aria-hidden="true"
          />
        </div>
      )}
      {/* </div> */}
      {errorMessage ? (
        <p className="mt-2 text-sm text-red-600" id={`${id}-description`}>
          {errorMessage}
        </p>
      ) : helperText ? (
        <p className="mt-2 text-sm text-gray-500" id={`${id}-description`}>
          {helperText}
        </p>
      ) : null}
    </>
  );
};

const PhoneInputForReactPhone = forwardRef(InputBase);
