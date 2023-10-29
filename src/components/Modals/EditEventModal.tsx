import 'dayjs/locale/pt-br';
import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/ui/button';
import { NumberInput, NumberInputHandlers, Group } from '@mantine/core';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';

import { Input } from '@components/ui/input';
import { Switch } from '@components/ui/switch';

import { DateTimePicker } from '@mantine/dates';
import { Loader2, Minus, Plus } from 'lucide-react';
import { MAX_CHECK_IN_AMOUNT, MIN_CHECK_IN_AMOUNT } from '@lib/constants';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { errorToast } from '@components/Toast/ErrorToast';
import { api } from '@lib/api';
import { successToast } from '@components/Toast/SuccessToast';
import { createEventFormSchema } from './CreateEventModal';
import { queryClient } from '@lib/queryClient';
import { EventFromAPI } from '@models/events/types';

export type EditEventFormData = z.infer<typeof createEventFormSchema>;

interface EditEventModalProps {
  event: EventFromAPI;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function EditEventModal({
  event,
  open,
  setOpen,
}: EditEventModalProps) {
  const handlers = useRef<NumberInputHandlers>(null);

  const form = useForm<EditEventFormData>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: {
      title: event.title,
      duration: event.duration,
      isLive: event.isLive,
      maxCheckinsQuantity: event.checkInsMaxQuantity
        ? event.checkInsMaxQuantity
        : 15,
      recordedUrl: event.recordedUrl || undefined,
      liveUrl: event.liveUrl || undefined,
      startDate: event.startDate ? new Date(event.startDate) : undefined,
    },
  });

  const handleEditEvent = async (data: EditEventFormData) => {
    try {
      await api.put(`events/edit?id=${event.id}`, {
        ...data,
      });

      queryClient.invalidateQueries({
        queryKey: ['events'],
      });

      successToast({
        message: 'evento editado com sucesso',
        description: 'seu evento já está disponível para checkins',
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
    }
  };

  const startDate = form.watch('startDate');

  return (
    <>
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
                    editar evento
                  </Dialog.Title>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleEditEvent)}
                      className="space-y-8"
                    >
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>título do evento</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="aula de yoga :)"
                                error={fieldState.error}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="liveUrl"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>url ao vivo do evento</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://youtube.com"
                                error={fieldState.error}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="recordedUrl"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>url gravada do evento</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://youtube.com"
                                error={fieldState.error}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <NumberInput
                        placeholder="duração do evento em minutos"
                        label="duração do evento (em minutos)"
                        value={form.watch('duration')}
                        onChange={(value) => {
                          if (value === '') return;
                          if (typeof value === 'string') return;
                          form.setValue('duration', value);
                        }}
                        step={5}
                      />

                      <div className="overflow-hidden rounded-lg border">
                        <div className="p-4">
                          <FormField
                            control={form.control}
                            name="isLive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    é um evento ao vivo?
                                  </FormLabel>
                                  <FormDescription>
                                    eventos ao vivo precisam de mais
                                    configuração
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {form.watch('isLive') && (
                            <div className="mt-4 flex-col space-y-2">
                              <DateTimePicker
                                valueFormat="DD [de] MMMM [de] YYYY [às] HH[h]mm"
                                label="dia e horário do evento"
                                placeholder="dia e horário"
                                mx="auto"
                                // date={
                                //   startDate ? new Date(startDate) : undefined
                                // }
                                value={
                                  startDate ? new Date(startDate) : undefined
                                }
                                onChange={(date) => {
                                  if (!date) return;
                                  form.setValue('startDate', date);
                                }}
                                minDate={new Date()}
                                locale="pt-br"
                                weekendDays={[]}
                                error={
                                  form.formState.errors?.startDate?.message
                                }
                              />

                              <div className="mt-4">
                                <NumberInput
                                  label="quantidade máxima de checkins"
                                  placeholder="Click the buttons"
                                  min={MIN_CHECK_IN_AMOUNT}
                                  max={MAX_CHECK_IN_AMOUNT}
                                  handlersRef={handlers}
                                  value={form.watch('maxCheckinsQuantity')}
                                  onChange={(value) => {
                                    if (value === '') return;
                                    if (typeof value === 'string') return;
                                    form.setValue('maxCheckinsQuantity', value);
                                  }}
                                  defaultValue={15}
                                />

                                <Group mt="md" justify="center">
                                  <Button
                                    onClick={() =>
                                      handlers.current?.decrement()
                                    }
                                    variant="default"
                                    onMouseDown={(event) =>
                                      event.preventDefault()
                                    }
                                    type="button"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>

                                  <Button
                                    onClick={() =>
                                      handlers.current?.increment()
                                    }
                                    variant="default"
                                    onMouseDown={(event) =>
                                      event.preventDefault()
                                    }
                                    type="button"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </Group>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex w-full items-center justify-center">
                        <Button
                          type="submit"
                          className="mx-auto w-2/4"
                          disabled={form.formState.isSubmitting}
                        >
                          {form.formState.isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              editando evento...
                            </>
                          ) : (
                            'editar evento'
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
