import 'dayjs/locale/pt-br';
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { User } from '@prisma/client';

import convertErrorMessage from '@lib/error/convertErrorMessage';
import { errorToast } from '@components/Toast/ErrorToast';
import { api } from '@lib/api';
import { successToast } from '@components/Toast/SuccessToast';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { Loader2 } from 'lucide-react';
import { Button } from '@components/ui/button';

interface ResetUserPasswordModalProps {
  user: User;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function ResetUserPasswordAlert({
  user,
  open,
  setOpen,
}: ResetUserPasswordModalProps) {
  const [isReseting, setIsReseting] = useState(false);
  const handleDeleteEvent = async () => {
    try {
      setIsReseting(true);
      const resetPasswordResponse = await api.put<{
        newPassword: string;
      }>(`/admin/users/reset-password?userId=${user.id}`);

      const newPassword = resetPasswordResponse.data.newPassword;

      // copy new password to clipboard
      navigator.clipboard.writeText(newPassword);

      successToast({
        message: 'senha alterada com sucesso!',
        description: `a nova senha é: ${newPassword}. ela foi copiada para a área de transferência :)`,
      });

      setIsReseting(false);
      setOpen(false);
    } catch (err) {
      const { message, description } = convertErrorMessage({
        err,
      });

      errorToast({
        message,
        description,
      });
      setIsReseting(false);
    }
  };

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40"
          // initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon
                        className="h-6 w-6 text-rose-500"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        redefinir senha
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          tem certeza que desenha redefinir a senha do usuário{' '}
                          <strong>{user.displayName}</strong>?
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          será gerada uma <strong>nova senha aleatória</strong>,
                          que será copiada para a área de transferência
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <Button
                      variant="secondary"
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                      onClick={handleDeleteEvent}
                    >
                      {isReseting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          redefinindo
                        </>
                      ) : (
                        'sim, redefinir'
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setOpen(false)}
                    >
                      cancelar
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
