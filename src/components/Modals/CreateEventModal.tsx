import 'dayjs/locale/pt-br';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/ui/button';
import {
  NumberInput,
  NumberInputHandlers,
  Group,
  Autocomplete,
} from '@mantine/core';
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
import { Loader2, Minus, Plus, XIcon, ChevronsUpDown } from 'lucide-react';
import { MAX_CHECK_IN_AMOUNT, MIN_CHECK_IN_AMOUNT } from '@lib/constants';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { errorToast } from '@components/Toast/ErrorToast';
import { api } from '@lib/api';
import { successToast } from '@components/Toast/SuccessToast';
import { queryClient } from '@lib/queryClient';
import useUser from '@hooks/useUser';
import { useInstructors } from '@hooks/useInstructors';
import { useTrails } from '@hooks/useTrails';
import {
  intensityOptions,
  intensityPossibleValues,
} from '@models/events/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Checkbox } from '@components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@components/ui/command';
import { cn } from '@utils';
import { Check } from 'lucide-react';

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
    isPremium: z.boolean().optional(),
    intensity: z
      .string()
      // check if the string is in the intensityPossibleValues array
      .refine((value) => {
        return intensityPossibleValues.includes(value);
      }, 'intensidade inválida')
      .optional(),
    instructorId: z.string().optional(),
    trailIds: z.array(z.string()).optional().default([]),
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
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [instructorSearch, setInstructorSearch] = useState('');
  const [selectedTrailId, setSelectedTrailId] = useState<string>('');
  const handlers = useRef<NumberInputHandlers>(null);

  const { data: instructors, isLoading: isInstructorsLoading } =
    useInstructors();

  const { data: trailsData, isLoading: isTrailsLoading } = useTrails({
    enabled: !!user && user.role === 'ADMIN',
    page: 1,
    pageSize: 100,
  });

  const instructorsOptions = instructors
    ? instructors.map((instructor) => ({
        value: instructor.id,
        label: instructor.name,
      }))
    : [];

  const trailsOptions = trailsData?.trails
    ? trailsData.trails.map((trail) => ({
        value: trail.id,
        label: trail.title,
      }))
    : [];

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: {
      isLive: false,
      maxCheckinsQuantity: 15,
      duration: 60,
      isPremium: true,
      trailIds: [],
    },
  });

  // Filter out already selected trails
  const availableTrails = trailsOptions.filter(
    (trail) => !form.watch('trailIds').includes(trail.value)
  );

  const addTrailToEvent = (trailId: string) => {
    const currentTrailIds = form.getValues('trailIds');
    if (!currentTrailIds.includes(trailId)) {
      form.setValue('trailIds', [...currentTrailIds, trailId]);
    }
    setSelectedTrailId('');
  };

  const removeTrailFromEvent = (trailId: string) => {
    const currentTrailIds = form.getValues('trailIds');
    form.setValue(
      'trailIds',
      currentTrailIds.filter((id) => id !== trailId)
    );
  };

  const getSelectedTrails = () => {
    const selectedIds = form.watch('trailIds');
    return trailsOptions.filter((trail) => selectedIds.includes(trail.value));
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN' && !form.watch('instructorId')) {
      form.setValue('instructorId', user.id);
      setInstructorSearch(user.name);
    }

    if (user && user.role === 'INSTRUCTOR') {
      form.setValue('instructorId', undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      form.reset();
      setInstructorSearch('');
      setSelectedTrailId('');
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
      <Button
        variant={`secondary`}
        onClick={() => {
          setOpen(true);
        }}
        className="rounded bg-purple-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-800"
      >
        adicionar evento
      </Button>
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

                      <FormField
                        control={form.control}
                        name="intensity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              intensidade
                              {field.value && (
                                <Button
                                  variant="outline"
                                  type="button"
                                  onClick={() => {
                                    form.setValue('intensity', undefined);
                                  }}
                                  className="ml-2 h-5 px-1"
                                >
                                  <XIcon className="h-3 w-3" />
                                </Button>
                              )}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  {field.value ? (
                                    <SelectValue placeholder="selecione a intensidade" />
                                  ) : (
                                    'selecione a intensidade'
                                  )}
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {intensityOptions.map((option) => {
                                  return (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {!form.watch('isLive') && (
                        <FormField
                          control={form.control}
                          name="isPremium"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>é uma aula exclusiva?</FormLabel>
                                <FormDescription>
                                  somente alunas com plano podem ver aulas
                                  exclusivas
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      )}

                      {user?.role === 'ADMIN' && !isInstructorsLoading && (
                        <Autocomplete
                          label="instrutor do evento"
                          value={instructorSearch}
                          onChange={(value) => {
                            setInstructorSearch(value);

                            const instructor = instructors?.find(
                              (instructor) => instructor.name === value
                            );

                            if (instructor) {
                              form.setValue('instructorId', instructor.id);
                            }
                          }}
                          data={instructorsOptions}
                          error={form.formState.errors?.instructorId?.message}
                        />
                      )}

                      {user?.role === 'ADMIN' && !isTrailsLoading && (
                        <div className="space-y-4">
                          <label className="text-sm font-medium">
                            trilhas (opcional)
                          </label>

                          {/* Trail Selection Dropdown */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'w-full justify-between text-gray-800',
                                  !selectedTrailId && 'text-muted-foreground'
                                )}
                                disabled={availableTrails.length === 0}
                              >
                                {availableTrails.length === 0
                                  ? 'todas as trilhas foram selecionadas'
                                  : 'adicionar trilha ao evento'}
                                <div className="flex items-center">
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </div>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="procurar trilha..." />
                                <CommandList>
                                  <CommandEmpty>
                                    nenhuma trilha encontrada :(
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {availableTrails.map((trail) => (
                                      <CommandItem
                                        value={trail.label}
                                        key={trail.value}
                                        onSelect={() => {
                                          addTrailToEvent(trail.value);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4 opacity-0'
                                          )}
                                        />
                                        <span>{trail.label}</span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>

                          {/* Selected Trails Display */}
                          {getSelectedTrails().length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">
                                trilhas selecionadas (
                                {getSelectedTrails().length}):
                              </p>
                              <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                                {getSelectedTrails().map((trail, index) => (
                                  <div
                                    key={trail.value}
                                    className="flex items-center justify-between rounded-md bg-gray-50 p-2"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-gray-500">
                                        {index + 1}.
                                      </span>
                                      <span className="text-sm font-medium">
                                        {trail.label}
                                      </span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        removeTrailFromEvent(trail.value)
                                      }
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                    >
                                      <XIcon className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

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
                        error={form.formState.errors?.startDate?.message}
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
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex w-full items-center justify-center">
                        <Button
                          variant={`secondary`}
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
