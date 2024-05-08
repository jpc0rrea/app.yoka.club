import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

export const clintApi = axios.create({
  baseURL: 'https://api.clint.digital/v1/',
  headers: {
    'api-token': process.env.CLINT_API_TOKEN,
  },
});
