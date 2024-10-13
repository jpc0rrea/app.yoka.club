import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import {
  forwardRef,
  ForwardRefRenderFunction,
  LegacyRef,
  useState,
} from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface PasswordInputProps {
  name: string;
  label?: string;
  id?: string;
  htmlFor?: string;
  placeholder?: string;
  className?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
}

const PasswordInputBase: ForwardRefRenderFunction<
  HTMLInputElement,
  PasswordInputProps
> = (
  {
    name,
    label,
    id,
    htmlFor,
    placeholder,
    className,
    helperText,
    errorMessage,
    required = false,
    ...rest
  },
  ref
) => {
  const [parent] = useAutoAnimate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div ref={parent as LegacyRef<HTMLDivElement>}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div className="relative mt-1 flex flex-grow items-stretch rounded-md shadow-sm focus-within:z-10">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          required={required}
          placeholder={placeholder}
          className={`block w-full appearance-none rounded-none rounded-l-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:ring-0 sm:text-sm ${className} ${
            errorMessage
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-red-500 focus:ring-red-500'
              : 'focus:border-brand-purple-900 focus:ring-brand-purple-900'
          }`}
          name={name}
          ref={ref}
          {...rest}
        />
        <button
          type="button"
          className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          onClick={() => {
            setShowPassword(!showPassword);
          }}
        >
          {showPassword ? (
            <EyeSlashIcon className="-ml-0.5 h-5 w-5 text-gray-400" />
          ) : (
            <EyeIcon className="-ml-0.5 h-5 w-5 text-gray-400" />
          )}
        </button>
        {errorMessage && (
          <div className="pointer-events-none absolute inset-y-0 right-[10%] flex items-center pr-3">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      {errorMessage ? (
        <p className="mt-1 text-sm text-red-600" id={`${id}-description`}>
          {errorMessage}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500" id={`${id}-description`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export const PasswordInput = forwardRef(PasswordInputBase);
