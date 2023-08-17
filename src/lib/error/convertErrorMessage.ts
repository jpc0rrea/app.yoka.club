import { AppError } from '.';
import axios, { AxiosError, isAxiosError } from 'axios';
import { APIError } from './types';

interface ConvertErrorMessageProps {
  err: unknown;
}

const defaultError = {
  message: 'aconteceu um erro',
  description: 'tente novamente mais tarde',
};

export default function convertErrorMessage({
  err,
}: ConvertErrorMessageProps): {
  message: string;
  description: string | undefined;
} {
  if (isAxiosError(err)) {
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
