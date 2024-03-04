import { Input } from '@components/ui/input';
import { Dispatch, SetStateAction, useState } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '@components/ui/button';
import convertQueryToSearchParams from '@lib/utilities/convertQueryInSearchParams';
import { useRouter } from 'next/router';
import { intensityOptions } from '@models/events/types';
import Filter from '@components/RecordedClassesSection/Filter';
import {
  durationOptions,
  isLiveOptions,
  premiumOptions,
} from '@components/RecordedClassesSection/Toolbar';

interface ToolbarProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  durationFilter: string[];
  setDurationFilter: Dispatch<SetStateAction<string[]>>;
  intensityFilter: string[];
  setIntensityFilter: Dispatch<SetStateAction<string[]>>;
  premiumFilter: string[];
  setPremiumFilter: Dispatch<SetStateAction<string[]>>;
  isLiveFilter: string[];
  setIsLiveFilter: Dispatch<SetStateAction<string[]>>;
}

export default function Toolbar({
  search,
  setSearch,
  durationFilter,
  setDurationFilter,
  intensityFilter,
  setIntensityFilter,
  premiumFilter,
  setPremiumFilter,
  isLiveFilter,
  setIsLiveFilter,
}: ToolbarProps) {
  const router = useRouter();
  const [searchToShowOnInput, setSearchToShowOnInput] = useState(search);

  return (
    <div className="flex items-center justify-between">
      <div className="items-center space-y-2 lg:flex lg:flex-1 lg:space-x-2 lg:space-y-0">
        <Input
          placeholder="procurar aula..."
          value={searchToShowOnInput}
          onChange={(event) => {
            setSearchToShowOnInput(event.target.value);
            setSearch(event.target.value);
            // get the url query params
            const searchParams = convertQueryToSearchParams(router.query);

            // Clear previous filter parameters
            searchParams.delete('search');

            if (event.target.value) {
              // Add new filter parameters
              searchParams.append('search', event.target.value);
            }

            router.push(
              {
                pathname: router.pathname,
                query: searchParams.toString(),
              },
              undefined,
              { shallow: true }
            );
          }}
          className="h-8 w-[150px] lg:w-[250px]"
          error={undefined}
        />
        <div className="space-y-2 lg:space-y-0">
          <Filter
            filteredValues={durationFilter}
            setFilteredValues={setDurationFilter}
            label="duração"
            options={durationOptions}
            queryParamName="duration"
            className="mr-2"
          />
          <Filter
            filteredValues={intensityFilter}
            setFilteredValues={setIntensityFilter}
            label="intensidade"
            options={intensityOptions}
            queryParamName="intensity"
            className="mr-2"
          />
          <Filter
            filteredValues={premiumFilter}
            setFilteredValues={setPremiumFilter}
            label="tipo"
            options={premiumOptions}
            queryParamName="premium"
            className="ml-0 mr-2"
          />
          <Filter
            filteredValues={isLiveFilter}
            setFilteredValues={setIsLiveFilter}
            label="ao vivo"
            options={isLiveOptions}
            queryParamName="isLive"
            className="ml-0"
          />
        </div>
        {(durationFilter.length > 0 ||
          intensityFilter.length > 0 ||
          premiumFilter.length > 0) && (
          <div>
            <Button
              variant="ghost"
              onClick={() => {
                setDurationFilter([]);
                setIntensityFilter([]);
                setPremiumFilter([]);

                // get the url query params
                const searchParams = convertQueryToSearchParams(router.query);

                // Clear previous filter parameters
                searchParams.delete('duration');
                searchParams.delete('intensity');
                searchParams.delete('premium');
                searchParams.delete('isLive');

                router.push(
                  {
                    pathname: router.pathname,
                    query: searchParams.toString(),
                  },
                  undefined,
                  { shallow: true }
                );
              }}
              className="h-8 px-2 lg:px-3"
            >
              limpar
              <XIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
