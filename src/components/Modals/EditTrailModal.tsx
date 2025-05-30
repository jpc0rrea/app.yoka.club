import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Loader2, XIcon, Check, ChevronsUpDown, CircleX } from 'lucide-react';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { errorToast } from '@components/Toast/ErrorToast';
import { api } from '@lib/api';
import { successToast } from '@components/Toast/SuccessToast';
import { queryClient } from '@lib/queryClient';
import { UploadDropzone } from '@lib/uploadthing';
import { useEvents, useRecordedEvents } from '@hooks/useEvents';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover';
import { cn } from '@utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@components/ui/command';
import IsPremiumBadge from '@components/reusables/IsPremiumBadge';
import { TrailFromAPI } from '@models/trails/types';

export const editTrailFormSchema = z.object({
  title: z
    .string({
      required_error: 'título da trilha é obrigatório',
    })
    .min(3, 'título da trilha deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  coverImageUrl: z
    .string({
      required_error: 'imagem de capa é obrigatória',
    })
    .url('URL da imagem inválida'),
  eventIds: z.array(z.string()).optional().default([]),
});

export type EditTrailFormData = z.infer<typeof editTrailFormSchema>;

interface EditTrailModalProps {
  trail: TrailFromAPI;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function EditTrailModal({
  trail,
  open,
  setOpen,
}: EditTrailModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const { data: eventsData } = useRecordedEvents({
    pageSize: 100, // Get more events for selection
  });

  const form = useForm<EditTrailFormData>({
    resolver: zodResolver(editTrailFormSchema),
    defaultValues: {
      title: trail.title,
      description: trail.description || '',
      coverImageUrl: trail.coverImageUrl,
      eventIds: trail.trailEvents.map((te) => te.event.id),
    },
  });

  // // Create events options for dropdown
  // const eventsOptions = eventsData?.events
  //   ? eventsData.events.map((event) => ({
  //       value: event.id,
  //       label: event.title,
  //       isPremium: event.isPremium,
  //       instructor: event.instructor.displayName,
  //     }))
  //   : [];

  // // Filter out already selected events
  // const availableEvents = eventsOptions.filter(
  //   (event) => !form.watch('eventIds').includes(event.value)
  // );

  const { data: events } = useEvents({
    isLive: false,
    page: 1,
    pageSize: 100000,
    enabled: true,
  });

  const eventsOptions = events
    ? events.map((event) => ({
        value: event.id,
        label: event.title,
        isPremium: event.isPremium,
      }))
    : [];

  const availableEvents = eventsOptions.filter(
    (event) => !form.watch('eventIds').includes(event.value)
  );

  // Reset form when trail changes
  useEffect(() => {
    form.reset({
      title: trail.title,
      description: trail.description || '',
      coverImageUrl: trail.coverImageUrl,
      eventIds: trail.trailEvents.map((te) => te.event.id),
    });
    setSelectedEventId('');
  }, [trail, form]);

  const handleEditTrail = async (data: EditTrailFormData) => {
    try {
      await api.put(`/admin/trails/${trail.id}`, {
        ...data,
      });

      queryClient.invalidateQueries({
        queryKey: ['trails'],
      });

      successToast({
        message: 'trilha atualizada com sucesso',
        description: 'as alterações foram salvas',
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

  const handleImageUpload = (url: string) => {
    form.setValue('coverImageUrl', url);
    setIsUploading(false);
  };

  const addEventToTrail = (eventId: string) => {
    const currentEventIds = form.getValues('eventIds');
    if (!currentEventIds.includes(eventId)) {
      form.setValue('eventIds', [...currentEventIds, eventId]);
    }
    setSelectedEventId('');
  };

  const removeEventFromTrail = (eventId: string) => {
    const currentEventIds = form.getValues('eventIds');
    form.setValue(
      'eventIds',
      currentEventIds.filter((id) => id !== eventId)
    );
  };

  const getSelectedEvents = () => {
    const selectedIds = form.watch('eventIds');
    return eventsOptions.filter((event) => selectedIds.includes(event.value));
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={setOpen}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <Dialog.Title
                  as="h3"
                  className="mx-auto mb-4 text-center text-xl font-semibold leading-6 text-purple-700"
                >
                  editar trilha
                </Dialog.Title>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleEditTrail)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>título da trilha</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="trilha de yoga para iniciantes"
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
                      name="description"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>descrição (opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="descreva o que os alunos aprenderão nesta trilha..."
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
                      name="coverImageUrl"
                      render={({ fieldState }) => (
                        <FormItem>
                          <FormLabel>imagem de capa</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              {form.watch('coverImageUrl') ? (
                                <div className="relative">
                                  <img
                                    src={form.watch('coverImageUrl')}
                                    alt="Capa da trilha"
                                    className="h-32 w-full rounded-lg object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="absolute right-2 top-2"
                                    onClick={() =>
                                      form.setValue('coverImageUrl', '')
                                    }
                                  >
                                    <XIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <UploadDropzone
                                  endpoint="trailCoverUploader"
                                  onClientUploadComplete={(res) => {
                                    if (res?.[0]?.url) {
                                      handleImageUpload(res[0].url);
                                    }
                                  }}
                                  onUploadError={(error: Error) => {
                                    errorToast({
                                      message: 'erro no upload',
                                      description: error.message,
                                    });
                                  }}
                                  onUploadBegin={() => setIsUploading(true)}
                                />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eventIds"
                      render={() => (
                        <FormItem>
                          <FormLabel>eventos da trilha (opcional)</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              {/* Event Selection Dropdown */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      'w-full justify-between text-gray-800',
                                      !selectedEventId &&
                                        'text-muted-foreground'
                                    )}
                                    disabled={availableEvents.length === 0}
                                  >
                                    {availableEvents.length === 0
                                      ? 'todos os eventos foram selecionados'
                                      : 'adicionar evento à trilha'}
                                    <div className="flex items-center">
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </div>
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput placeholder="procurar evento..." />
                                    <CommandList>
                                      <CommandEmpty>
                                        nenhum evento encontrado :(
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {availableEvents.map((event) => (
                                          <CommandItem
                                            value={event.label}
                                            key={event.value}
                                            onSelect={() => {
                                              addEventToTrail(event.value);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                'mr-2 h-4 w-4 opacity-0'
                                              )}
                                            />
                                            <div className="flex flex-col">
                                              <div className="flex items-center gap-2">
                                                <span>{event.label}</span>
                                                <IsPremiumBadge
                                                  isPremium={event.isPremium}
                                                />
                                              </div>
                                            </div>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>

                              {/* Selected Events Display */}
                              {getSelectedEvents().length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700">
                                    eventos selecionados (
                                    {getSelectedEvents().length}):
                                  </p>
                                  <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                                    {getSelectedEvents().map((event, index) => (
                                      <div
                                        key={event.value}
                                        className="flex items-center justify-between rounded-md bg-gray-50 p-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-medium text-gray-500">
                                            {index + 1}.
                                          </span>
                                          <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium">
                                                {event.label}
                                              </span>
                                              <IsPremiumBadge
                                                isPremium={event.isPremium}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            removeEventFromTrail(event.value)
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex w-full items-center justify-center">
                      <Button
                        variant="secondary"
                        type="submit"
                        className="mx-auto w-full md:w-2/4"
                        disabled={form.formState.isSubmitting || isUploading}
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            salvando alterações...
                          </>
                        ) : (
                          'salvar alterações'
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
  );
}
