import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';

interface ToastProps {
  message: string;
  description?: string;
  toastDismissFunction: () => void;
}

interface SuccessToastProps {
  message: string;
  description?: string;
}

const successToast = ({ message, description }: SuccessToastProps) =>
  toast((t) => (
    <SuccessToast
      message={message}
      description={description}
      toastDismissFunction={() => {
        toast.dismiss(t.id);
      }}
    />
  ));

export { successToast };

export default function SuccessToast({
  message,
  description,
  toastDismissFunction,
}: ToastProps) {
  return (
    <div className="my-[-4px] mx-[-10px] rounded-md bg-green-50 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <CheckCircleIcon
            className="h-6 w-6 text-green-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 flex-1 pt-0.5">
          <p className="text-sm font-medium text-green-800">{message}</p>
          {description && (
            <p className="mt-1 text-sm text-green-700">{description}</p>
          )}
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            type="button"
            className="inline-flex rounded-md bg-green-50 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            onClick={toastDismissFunction}
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
