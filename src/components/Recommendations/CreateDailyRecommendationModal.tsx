import { Button } from '@components/ui/button';
import { useEvents } from '@hooks/useEvents';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, CircleX } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@components/ui/form';
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
import { api } from '@lib/api';
import { successToast } from '@components/Toast/SuccessToast';
import { errorToast } from '@components/Toast/ErrorToast';
import { queryClient } from '@lib/queryClient';
import IsPremiumBadge from '@components/reusables/IsPremiumBadge';

interface CreateDailyRecommendationModalProps {
  date: Date;
}

const FormSchema = z.object({
  eventId: z.string({
    required_error: 'Escolha um evento',
  }),
});

export default function CreateDailyRecommendationModal({
  date,
}: CreateDailyRecommendationModalProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

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

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await api.post('/daily-recommendations/create', {
        date,
        eventId: data.eventId,
      });

      queryClient.invalidateQueries(['daily-recommendations']);

      successToast({
        message: 'recomendação adicionada com sucesso',
      });
    } catch (error) {
      console.error(error);

      errorToast({
        message: 'ocorreu um erro ao adicionar a recomendação',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <p className="mb-2 text-sm font-semibold text-gray-900">
          adicionar recomendação de prática para o dia{' '}
          <strong>
            {format(date, "dd 'de' MMMM, yyy", {
              locale: ptBR,
            })}
          </strong>
        </p>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="eventId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                {/* <FormLabel>prática</FormLabel> */}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'w-[500px] justify-between text-gray-800',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value
                          ? eventsOptions.find(
                              (event) => event.value === field.value
                            )?.label
                          : 'escolha uma prática'}
                        <div className="flex items-center">
                          {field.value && (
                            <Button
                              variant="ghost"
                              className="ml-2 h-4 w-4"
                              type="button"
                              onClick={() => {
                                form.reset();
                              }}
                            >
                              <CircleX className="h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          {/* if theres a value, show the clear button */}
                        </div>
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0">
                    <Command>
                      <CommandInput placeholder="procurar a prática..." />
                      <CommandList>
                        <CommandEmpty>
                          nenhuma prática encontrada :(
                        </CommandEmpty>
                        <CommandGroup>
                          {eventsOptions.map((event) => (
                            <CommandItem
                              value={event.label}
                              key={event.value}
                              onSelect={() => {
                                form.setValue('eventId', event.value);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  event.value === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {event.label}
                              <div className="ml-1">
                                <IsPremiumBadge isPremium={event.isPremium} />
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="mt-4">
          adicionar recomendação
        </Button>
      </form>
    </Form>
  );
}
