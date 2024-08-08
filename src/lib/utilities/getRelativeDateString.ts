import { differenceInDays } from 'date-fns';

export default function getRelativeDateString(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  const diffDays = differenceInDays(inputDate, today);

  const weekdays = [
    'domingo',
    'segunda',
    'terça',
    'quarta',
    'quinta',
    'sexta',
    'sábado',
  ];

  if (diffDays === 0) {
    return 'hoje';
  } else if (diffDays === 1) {
    return 'amanhã';
  } else if (diffDays > 1 && diffDays < 7) {
    return weekdays[inputDate.getDay()];
  } else {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
    });
    const formattedDate = formatter.format(inputDate);
    return formattedDate.replace(' de ', ' de ');
  }
}
