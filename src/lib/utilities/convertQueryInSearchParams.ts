import { ParsedUrlQuery } from 'querystring';

const convertQueryToSearchParams = (query: ParsedUrlQuery): URLSearchParams => {
  const params = new URLSearchParams();

  for (const key of Object.keys(query)) {
    const value = query[key];

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else {
      params.append(key, value || '');
    }
  }

  return params;
};

export default convertQueryToSearchParams;
