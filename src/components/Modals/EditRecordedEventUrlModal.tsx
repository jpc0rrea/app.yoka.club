import { Fragment, useCallback, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

import convertErrorMessage from '@lib/error/convertErrorMessage';
import { errorToast } from '@components/Toast/ErrorToast';
import { api } from '@lib/api';
import { successToast } from '@components/Toast/SuccessToast';
import { queryClient } from '@lib/queryClient';
import { Input } from '@mantine/core';
import { Loader2 } from 'lucide-react';

interface EditRecordedEventUrlModalProps {
  eventId: string;
  recordedUrl?: string;
}

export default function EditRecordedEventUrlModal({
  eventId,
  recordedUrl,
}: EditRecordedEventUrlModalProps) {
  const [open, setOpen] = useState(false);
  const [inputedRecordedUrl, setInputRecordedUrl] = useState<string>(
    recordedUrl || ''
  );
  const [isEditting, setIsEditting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEditUrl = useCallback(async () => {
    // check if url is a valid URL
    const isValid = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name and extension
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?' + // port
        '(\\/[-a-z\\d%_.~+]*)*' + // path
        '(\\?[;&amp;a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ) // fragment locator
      .test(inputedRecordedUrl);

    if (!isValid) {
      errorToast({
        message: 'url inválida',
      });
      setErrorMessage('url inválida');
      return;
    }
    try {
      setIsEditting(true);

      await api.put(`events/updateRecordedUrl?id=${eventId}`, {
        recordedUrl: inputedRecordedUrl,
      });

      successToast({
        message: 'url editada com sucesso',
      });

      setOpen(false);

      queryClient.invalidateQueries({
        queryKey: ['events'],
      });
      setIsEditting(false);
    } catch (err) {
      const { message, description } = convertErrorMessage({
        err,
        isFromAxios: true,
      });

      errorToast({
        message,
        description,
      });

      setIsEditting(false);
    }
  }, [inputedRecordedUrl, eventId]);

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
        }}
        className="hidden rounded bg-purple-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-800 sm:block"
      >
        {recordedUrl ? 'editar link gravado' : 'cadastrar link gravado'}
      </button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
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
                  <Dialog.Title
                    as="h3"
                    className="mx-auto mb-4 text-center text-xl font-semibold leading-6 text-purple-700"
                  >
                    {recordedUrl
                      ? 'editar link gravado'
                      : 'cadastrar link gravado'}
                  </Dialog.Title>
                  <Input.Wrapper
                    id="url"
                    label="url gravada do evento"
                    error={errorMessage}
                  >
                    <Input
                      id="url"
                      placeholder="url do evento"
                      value={inputedRecordedUrl}
                      onChange={(event) => {
                        if (errorMessage) setErrorMessage('');
                        setInputRecordedUrl(event.currentTarget.value);
                      }}
                      error={errorMessage}
                    />
                  </Input.Wrapper>
                  <div className="flex w-full items-center">
                    <button
                      onClick={handleEditUrl}
                      className="mx-auto mt-4 flex w-1/2 items-center justify-center rounded bg-purple-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-800"
                    >
                      {isEditting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {recordedUrl ? 'editando...' : 'cadastrando...'}
                        </>
                      ) : recordedUrl ? (
                        'editar'
                      ) : (
                        'cadastrar'
                      )}
                    </button>
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
