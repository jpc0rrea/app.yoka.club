import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { forwardRef, ForwardRefRenderFunction, LegacyRef } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

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

const InputBase: ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  {
    name,
    label,
    type,
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
      <div className="relative mt-1 rounded-md shadow-sm">
        <input
          id={id}
          type={type}
          required={required}
          placeholder={placeholder}
          className={`block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm sm:text-sm ${className} ${
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
      </div>
      {errorMessage ? (
        <p className="mt-2 text-sm text-red-600" id={`${id}-description`}>
          {errorMessage}
        </p>
      ) : helperText ? (
        <p className="mt-2 text-sm text-gray-500" id={`${id}-description`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export const Input = forwardRef(InputBase);
