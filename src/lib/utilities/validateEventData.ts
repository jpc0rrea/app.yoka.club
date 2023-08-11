import { CreateEventFormData } from '@components/Modals/CreateEventModal';
import { MAX_CHECK_IN_AMOUNT, MIN_CHECK_IN_AMOUNT } from '@lib/constants';
import { AppError } from '@lib/error';

export default function validateEventData({
  title,
  duration,
  isLive,
  liveUrl,
  recordedUrl,
  maxCheckinsQuantity,
  startDate,
}: CreateEventFormData) {
  if (!title || title.length < 6) {
    throw new AppError({
      title: 'título inválido',
      description: 'o título deve ter pelo menos 6 caracteres',
    });
  }

  if (!isLive && !recordedUrl) {
    throw new AppError({
      title: 'url inválida',
      description: 'a url deve ser preenchida para eventos gravados',
    });
  }

  if (isLive && !liveUrl) {
    throw new AppError({
      title: 'url inválida',
      description: 'a url deve ser preenchida para eventos ao vivo',
    });
  }

  if (!duration) {
    throw new AppError({
      title: 'duração inválida',
      description: 'a duração deve ser preenchida',
    });
  }

  if (isLive) {
    if (!startDate) {
      throw new AppError({
        title: 'data inválida',
        description: 'a data deve ser preenchida para eventos ao vivo',
      });
    }

    if (new Date(startDate) < new Date()) {
      throw new AppError({
        title: 'data inválida',
        description: 'a data deve ser maior que a data atual',
      });
    }

    if (
      !maxCheckinsQuantity ||
      maxCheckinsQuantity < MIN_CHECK_IN_AMOUNT ||
      maxCheckinsQuantity > MAX_CHECK_IN_AMOUNT
    ) {
      throw new AppError({
        title: 'quantidade de checkins inválida',
        description: `a quantidade de checkins deve ser entre ${MIN_CHECK_IN_AMOUNT} e ${MAX_CHECK_IN_AMOUNT}`,
      });
    }
  }
}
