import 'dayjs/locale/pt-br';
import { Fragment, useRef, useState } from 'react';
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
import { queryClient } from '@lib/queryClient';

export const createEventFormSchema = z
  .object({
    title: z
      .string({
        required_error: 'nome do evento é obrigatório',
      })
      .min(6, 'nome do evento deve ter no mínimo 6 caracteres'),
    isLive: z.boolean(),
    startDate: z.date().optional(),
    maxCheckinsQuantity: z
      .number()
      .min(
        MIN_CHECK_IN_AMOUNT,
        `quantidade máxima de checkins deve ser no mínimo ${MIN_CHECK_IN_AMOUNT}`
      )
      .max(
        MAX_CHECK_IN_AMOUNT,
        `quantidade máxima de checkins deve ser no máximo ${MAX_CHECK_IN_AMOUNT}`
      )
      .optional(),
    liveUrl: z.string().url('url inválida :(').optional(),
    recordedUrl: z.string().url('url inválida :(').optional(),
    duration: z.number(),
  })
  .refine((data) => (data.isLive ? data.startDate : true), {
    message: 'data de início é obrigatória para eventos ao vivo',
    path: ['startDate'],
  })
  .refine((data) => (data.isLive ? data.maxCheckinsQuantity : true), {
    message: 'quantidade máxima de checkins é obrigatória para eventos ao vivo',
    path: ['maxCheckinsQuantity'],
  })
  .refine((data) => (data.isLive ? data.liveUrl : true), {
    message: 'url do evento ao vivo é obrigatória para eventos ao vivo',
    path: ['liveUrl'],
  })
  .refine((data) => (!data.isLive ? data.recordedUrl : true), {
    message: 'url do evento gravado é obrigatória para eventos gravados',
    path: ['recordedUrl'],
  });

export type CreateEventFormData = z.infer<typeof createEventFormSchema>;

export default function CreateEventModal() {
  const [open, setOpen] = useState(false);
  const handlers = useRef<NumberInputHandlers>(null);

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: {
      isLive: false,
      maxCheckinsQuantity: 15,
      duration: 60,
    },
  });

  const handleCreateEvent = async (data: CreateEventFormData) => {
    try {
      await api.post('events/create', {
        ...data,
      });

      queryClient.invalidateQueries({
        queryKey: ['events'],
      });

      successToast({
        message: 'evento criado com sucesso',
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

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
        }}
        className="rounded bg-purple-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-800"
      >
        adicionar evento
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
                    cadastrar novo evento
                  </Dialog.Title>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleCreateEvent)}
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
                            {/* <FormDescription>descreva o evento</FormDescription> */}
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
                            {/* <FormDescription>descreva o evento</FormDescription> */}
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
                            {/* <FormDescription>descreva o evento</FormDescription> */}
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
                                // date={form.watch('startDate')}
                                value={form.watch('startDate')}
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
                          className="mx-auto w-full md:w-2/4"
                          disabled={form.formState.isSubmitting}
                        >
                          {form.formState.isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              criando evento...
                            </>
                          ) : (
                            'criar evento'
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
