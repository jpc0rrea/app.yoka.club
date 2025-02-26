import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover';
import { Separator } from '@components/ui/separator';
import convertQueryToSearchParams from '@lib/utilities/convertQueryInSearchParams';
import { cn } from '@utils';
import { CheckIcon, PlusCircleIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction } from 'react';

interface FilterProps {
  filteredValues: string[];
  setFilteredValues: Dispatch<SetStateAction<string[]>>;
  options: { label: string; value: string }[];
  label: string;
  queryParamName: string;
  className?: string;
}

export default function Filter({
  filteredValues,
  setFilteredValues,
  options,
  label,
  queryParamName,
  className,
}: FilterProps) {
  const router = useRouter();

  const addFilter = (value: string) => {
    const newFilteredValues = [...filteredValues, value];
    setFilteredValues(newFilteredValues);

    // get the url query params
    const searchParams = convertQueryToSearchParams(router.query);

    // Clear previous filter parameters
    searchParams.delete(queryParamName.toLowerCase());

    // Add new filter parameters
    newFilteredValues.forEach((filter) =>
      searchParams.append(queryParamName.toLowerCase(), filter)
    );

    router.push(
      {
        pathname: router.pathname,
        query: searchParams.toString(),
      },
      undefined,
      { shallow: true }
    );
  };

  const removeFilter = (value: string) => {
    const newFilteredValues = filteredValues.filter((v) => v !== value);
    setFilteredValues(newFilteredValues);

    // get the url query params
    const searchParams = convertQueryToSearchParams(router.query);

    // Clear previous filter parameters
    searchParams.delete(queryParamName.toLowerCase());

    // Add new filter parameters
    newFilteredValues.forEach((filter) =>
      searchParams.append(queryParamName.toLowerCase(), filter)
    );

    router.push(
      {
        pathname: router.pathname,
        query: searchParams.toString(),
      },
      undefined,
      { shallow: true }
    );
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-6 md:h-8 border-dashed ${className}`}
        >
          <PlusCircleIcon className="mr-2 h-3 md:h-4 w-3 md:w-4" />
          {label}
          {filteredValues.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-3 md:h-4" />
              <Badge
                variant="secondary"
                className="min-w-max rounded-sm px-1 font-normal xl:hidden"
              >
                {filteredValues.length}
              </Badge>
              <div className="hidden space-x-1 xl:flex">
                {filteredValues.length > 2 ? (
                  <Badge
                    variant="secondary"
                    className="min-w-max rounded-sm px-1 font-normal"
                  >
                    {filteredValues.length} selecionados
                  </Badge>
                ) : (
                  options
                    .filter((option) => filteredValues.includes(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="min-w-max rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          {/* <CommandInput placeholder="duração" /> */}
          <CommandList>
            <CommandEmpty>Não foi encontrado</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = filteredValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        removeFilter(option.value);
                      } else {
                        addFilter(option.value);
                      }
                      // const filterValues = Array.from(selectedValues);
                      // column?.setFilterValue(
                      //   filterValues.length ? filterValues : undefined
                      // );
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-3 md:h-4 w-3 md:w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className={cn('h-3 md:h-4 w-3 md:w-4')} />
                    </div>
                    {/* {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )} */}
                    <span>{option.label}</span>
                    {/* {facets?.get(option.value) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )} */}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {filteredValues.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setFilteredValues([]);

                      // get the url query params
                      const searchParams = convertQueryToSearchParams(
                        router.query
                      );

                      // Clear previous filter parameters
                      searchParams.delete(queryParamName.toLowerCase());

                      router.push(
                        {
                          pathname: router.pathname,
                          query: searchParams.toString(),
                        },
                        undefined,
                        { shallow: true }
                      );
                    }}
                    className="justify-center text-center"
                  >
                    limpar
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
