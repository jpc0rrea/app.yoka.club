import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { z } from 'zod';

import eventUtils from '@models/events/utils';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { errorToast } from '@components/Toast/ErrorToast';
import { api } from '@lib/api';
import { successToast } from '@components/Toast/SuccessToast';
import { createEventFormSchema } from './CreateEventModal';
import { EventFromAPI } from '@models/events/types';
import { Checkbox } from '@components/ui/checkbox';
import { Button } from '@components/ui/button';
import { Loader2 } from 'lucide-react';

export type EditEventFormData = z.infer<typeof createEventFormSchema>;

interface UpdateAttendanceModalProps {
  event: EventFromAPI;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function UpdateAttendanceModal({
  event,
  open,
  setOpen,
}: UpdateAttendanceModalProps) {
  const [attendance, setAttendance] = useState(event.checkIns);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAttendanceChange = (id: string, attended: boolean) => {
    setAttendance((current) =>
      current.map((checkIn) =>
        checkIn.id === id ? { ...checkIn, attended } : checkIn
      )
    );
  };

  const submitAttendance = async () => {
    try {
      setIsSubmitting(true);
      await api.put('/events/attendance', {
        eventId: event.id,
        attendance: attendance.map((checkIn) => ({
          id: checkIn.id,
          attended: checkIn.attended,
        })),
      });
      successToast({
        message: 'lista de presença atualizada com sucesso.',
      });
      setOpen(false);
    } catch (err) {
      const { message, description } = convertErrorMessage({
        err,
      });
      errorToast({
        message,
        description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventHasStarted = eventUtils.hasStarted({ event });

  if (!eventHasStarted) {
    return null;
  }
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                  <Dialog.Title
                    as="h3"
                    className="mx-auto mb-4 text-left text-xl font-semibold leading-6 text-purple-700"
                  >
                    lista de presença
                  </Dialog.Title>

                  {event.checkIns.length === 0 ? (
                    <Dialog.Description className="text-left text-gray-600">
                      que pena. nenhuma aluna fez check-in nessa aula :(
                    </Dialog.Description>
                  ) : (
                    <>
                      <Dialog.Description className="text-left text-gray-600">
                        marque as alunas que estiveram presente no evento:{' '}
                        <strong className="text-brand-purple-800">
                          {event.title}
                        </strong>
                      </Dialog.Description>

                      <div className="mt-4 flex w-full items-center">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            submitAttendance();
                          }}
                          className="w-full"
                        >
                          <div className="space-y-2">
                            {attendance
                              .sort((a, b) => {
                                // sort by checkIn createdAt
                                return (
                                  new Date(b.createdAt).getTime() -
                                  new Date(a.createdAt).getTime()
                                );
                              })
                              .map((checkIn) => (
                                <div
                                  className="flex flex-row items-center space-x-3 space-y-0"
                                  key={checkIn.id}
                                >
                                  <Checkbox
                                    checked={!!checkIn.attended}
                                    onClick={() => {
                                      handleAttendanceChange(
                                        checkIn.id,
                                        !checkIn.attended
                                      );
                                    }}
                                  />
                                  <label
                                    htmlFor="terms"
                                    className="font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {checkIn.user.displayName}
                                  </label>
                                </div>
                              ))}
                          </div>
                          <Button
                            type="submit"
                            className="mx-auto mt-4 min-w-[80px]"
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'salvar'
                            )}
                          </Button>
                        </form>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
