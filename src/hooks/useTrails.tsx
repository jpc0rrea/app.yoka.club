import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';
import { TrailFromAPI, ListTrailsParams } from '@models/trails/types';
import convertParamsInQueryParams from '@lib/utilities/convertParamsInQueryParams';

export async function listTrails(listTrailParams: ListTrailsParams) {
  const queryString = convertParamsInQueryParams(listTrailParams);

  const trailsResponse = await api.get<{
    trails: TrailFromAPI[];
    totalPages: number;
    trailsCount: number;
  }>(`/admin/trails${queryString}`);

  return trailsResponse.data;
}

// Public trails endpoint for non-admin users
export async function listPublicTrails(listTrailParams: ListTrailsParams) {
  const queryString = convertParamsInQueryParams(listTrailParams);

  const trailsResponse = await api.get<{
    trails: TrailFromAPI[];
    totalPages: number;
    trailsCount: number;
  }>(`/trails${queryString}`);

  return trailsResponse.data;
}

interface UseTrailsParams extends ListTrailsParams {
  enabled: boolean;
}

export function useTrails({ enabled, ...listTrailParams }: UseTrailsParams) {
  return useQuery({
    queryKey: [
      'trails',
      {
        listTrailParams,
        enabled,
      },
    ],
    queryFn: () => listTrails(listTrailParams),
    enabled,
  });
}

// Public hook for trails
export function usePublicTrails({
  enabled,
  ...listTrailParams
}: UseTrailsParams) {
  return useQuery({
    queryKey: [
      'public-trails',
      {
        listTrailParams,
        enabled,
      },
    ],
    queryFn: () => listPublicTrails(listTrailParams),
    enabled,
  });
}

interface GetTrailByIdParams {
  trailId: string;
}

export async function getTrailById({
  trailId,
}: GetTrailByIdParams): Promise<TrailFromAPI> {
  const trailResponse = await api.get<{
    trail: TrailFromAPI;
  }>(`/admin/trails/${trailId}`);

  return trailResponse.data.trail;
}

// Public version for regular users
export async function getPublicTrailById({
  trailId,
}: GetTrailByIdParams): Promise<TrailFromAPI> {
  const trailResponse = await api.get<{
    trail: TrailFromAPI;
  }>(`/trails/${trailId}`);

  return trailResponse.data.trail;
}

export function useTrailById({ trailId }: GetTrailByIdParams) {
  return useQuery({
    queryKey: ['trails', 'byId', trailId],
    queryFn: () => getTrailById({ trailId }),
  });
}

// Public hook for regular users
export function usePublicTrailById({ trailId }: GetTrailByIdParams) {
  return useQuery({
    queryKey: ['public-trails', 'byId', trailId],
    queryFn: () => getPublicTrailById({ trailId }),
  });
}
