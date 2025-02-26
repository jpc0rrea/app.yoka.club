import { Input } from '@components/ui/input';
import { Dispatch, SetStateAction, useState } from 'react';
import Filter from './Filter';
import { Check, Heart, Video, XIcon } from 'lucide-react';
import { Button } from '@components/ui/button';
import convertQueryToSearchParams from '@lib/utilities/convertQueryInSearchParams';
import { useRouter } from 'next/router';
import { intensityOptions } from '@models/events/types';
import { Toggle } from '@components/ui/toggle';

export const durationOptions = [
  { label: '15 min', value: '15' },
  { label: '30 min', value: '30' },
  { label: '45 min', value: '45' },
  { label: '60 min', value: '60' },
];

export const premiumOptions = [
  { label: 'exclusiva', value: 'exclusiva' },
  { label: 'gratuita', value: 'gratuita' },
];

export const isLiveOptions = [
  { label: 'ao vivo', value: 'live' },
  { label: 'gravada', value: 'recorded' },
];

interface ToolbarProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  durationFilter: string[];
  setDurationFilter: Dispatch<SetStateAction<string[]>>;
  intensityFilter: string[];
  setIntensityFilter: Dispatch<SetStateAction<string[]>>;
  premiumFilter: string[];
  setPremiumFilter: Dispatch<SetStateAction<string[]>>;
  favoritesFilter: boolean;
  setFavoritesFilter: Dispatch<SetStateAction<boolean>>;
  liveFilter: boolean;
  setLiveFilter: Dispatch<SetStateAction<boolean>>;
  hasCheckedInFilter: boolean;
  setHasCheckedInFilter: Dispatch<SetStateAction<boolean>>;
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
  favoritesFilter,
  setFavoritesFilter,
  liveFilter,
  setLiveFilter,
  hasCheckedInFilter,
  setHasCheckedInFilter,
}: ToolbarProps) {
  const router = useRouter();
  const [searchToShowOnInput, setSearchToShowOnInput] = useState(search);

  return (
    <div className="flex items-center justify-between">
      <div className="items-center space-y-2 xl:flex xl:flex-1 xl:space-x-2 xl:space-y-0">
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
          className="mb-2 h-8 w-[250px] xl:mb-0 "
          error={undefined}
        />
        <div className="space-y-1 lg:space-y-0">
          <Toggle
            aria-label="Toggle favorites"
            className="mr-2 h-6 md:h-8 border border-dashed"
            pressed={favoritesFilter}
            size="sm"
            onPressedChange={(pressed: boolean) => {
              setFavoritesFilter(pressed);

              // get the url query params
              const searchParams = convertQueryToSearchParams(router.query);

              // Clear previous filter parameters
              searchParams.delete('favorites');

              if (pressed) {
                // Add new filter parameters
                searchParams.append('favorites', 'true');
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
          >
            <Heart
              className={`mr-2 h-3 md:h-4 w-3 md:w-4 ${
                favoritesFilter ? 'fill-brand-purple-800' : 'fill-transparent'
              }`}
            />
            favoritas
          </Toggle>
          <Toggle
            aria-label="Toggle live"
            className="mr-2 h-6 md:h-8 min-w-max border border-dashed"
            pressed={liveFilter}
            size="sm"
            onPressedChange={(pressed: boolean) => {
              setLiveFilter(pressed);

              // get the url query params
              const searchParams = convertQueryToSearchParams(router.query);

              // Clear previous filter parameters
              searchParams.delete('live');

              if (pressed) {
                // Add new filter parameters
                searchParams.append('live', 'true');
              } else {
                searchParams.delete('checkin');
                setHasCheckedInFilter(false);
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
          >
            <Video
              className={`mr-2 h-3 md:h-4 w-3 md:w-4 ${
                liveFilter ? 'fill-brand-purple-800' : 'fill-transparent'
              }`}
            />
            ao vivo
          </Toggle>
          {liveFilter && (
            <Toggle
              aria-label="Toggle checkd in"
              className=" h-6 md:h-8 min-w-max border border-dashed"
              pressed={hasCheckedInFilter}
              size="sm"
              onPressedChange={(pressed: boolean) => {
                setHasCheckedInFilter(pressed);

                // get the url query params
                const searchParams = convertQueryToSearchParams(router.query);

                // Clear previous filter parameters
                searchParams.delete('checkin');

                if (pressed) {
                  // Add new filter parameters
                  searchParams.append('checkin', 'true');
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
            >
              <Check
                className={`mr-2 h-3 md:h-4 w-3 md:w-4 ${
                  hasCheckedInFilter ? '' : 'fill-transparent'
                }`}
              />
              fez check-in
            </Toggle>
          )}
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
          {!liveFilter && (
            <Filter
              filteredValues={premiumFilter}
              setFilteredValues={setPremiumFilter}
              label="exclusividade"
              options={premiumOptions}
              queryParamName="premium"
              className="ml-0"
            />
          )}
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
                setFavoritesFilter(false);

                // get the url query params
                const searchParams = convertQueryToSearchParams(router.query);

                // Clear previous filter parameters
                searchParams.delete('duration');
                searchParams.delete('intensity');
                searchParams.delete('premium');
                searchParams.delete('favorites');
                searchParams.delete('live');
                searchParams.delete('checkin');

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
