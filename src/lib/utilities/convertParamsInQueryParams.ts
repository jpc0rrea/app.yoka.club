export default function convertParamsInQueryParams(params: object): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    );

  return entries.length > 0 ? `?${entries.join('&')}` : '';
}
