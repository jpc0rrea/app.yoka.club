import { AppError } from '.';
import axios, { AxiosError } from 'axios';
import { APIError } from './types';

interface ConvertErrorMessageProps {
  err: unknown;
  isFromAxios?: boolean;
}

const defaultError = {
  message: 'aconteceu um erro',
  description: 'tente novamente mais tarde',
};

export default function convertErrorMessage({
  err,
  isFromAxios = false,
}: ConvertErrorMessageProps): {
  message: string;
  description: string | undefined;
} {
  if (isFromAxios) {
    const error = err as AxiosError<APIError>;

    if (
      axios.isAxiosError(error) &&
      error.response &&
      error.response.data &&
      error.response.data.message
    ) {
      const { message, description } = error.response.data;

      return { message, description };
    } else {
      return defaultError;
    }
  }
  if (!(err instanceof AppError)) {
    return defaultError;
  }

  return {
    message: err.title,
    description: err.description,
  };
}
