import { XCircleIcon, XMarkIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';

interface ToastProps {
  message: string;
  description?: string;
  toastDismissFunction: () => void;
}

interface ErrorToastProps {
  message: string;
  description?: string;
}

const errorToast = ({ message, description }: ErrorToastProps) =>
  toast((t) => (
    <ErrorToast
      message={message}
      description={description}
      toastDismissFunction={() => {
        toast.dismiss(t.id);
      }}
    />
  ));

export { errorToast };

export default function ErrorToast({
  message,
  description,
  toastDismissFunction,
}: ToastProps) {
  return (
    <div className="mx-[-10px] my-[-4px] rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800">{message}</p>
          {description && (
            <div className="mt-1 text-sm text-red-700">
              <p>{description}</p>
            </div>
          )}
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            type="button"
            className="inline-flex h-min rounded-md bg-red-50 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
