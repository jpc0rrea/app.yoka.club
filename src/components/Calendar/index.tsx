import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

import { classNames } from '@utils/classNames';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EventItem from './EventItem';

const colStartClassByWeekDay = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];

const usersWhoCheckedIn = [
  {
    id: 'clcnjt32i0000xms6adn9hs4',
    name: 'kaká',
    imageUrl: '/preview.jpeg',
  },
  {
    id: 'clcnjt32i0000xms6adn9hs4r',
    name: 'jp',
    imageUrl: '/preview.jpeg',
  },
  {
    id: 'clcnjt32i0000xms6adn9hs',
    name: 'anna',
    imageUrl: '/preview.jpeg',
  },
  {
    id: 'clcnjt32i0000xms6ad',
    name: 'rose',
    imageUrl: '/preview.jpeg',
  },
  {
    id: 'clcnjt32i0000s6ad',
    name: 'vicente',
    imageUrl: '/preview.jpeg',
  },
  {
    id: 'clcnjt32i',
    name: 'rafael',
    imageUrl: '/preview.jpeg',
  },
  {
    id: 'c000xms6ad',
    name: 'mel',
    imageUrl: '/preview.jpeg',
  },
  {
    id: '0xms6ad',
    name: 'edina',
    imageUrl: '/preview.jpeg',
  },
];

export interface Event {
  id: number;
  instructor: string;
  name: string;
  instructorImageUrl: string;
  checkInsQuantity: number;
  checkInsMaxQuantity: number;
  startDatetime: string;
  usersWhoCheckedIn: {
    id: string;
    name: string;
    imageUrl: string;
  }[];
}

const events: Event[] = [
  {
    id: 1,
    instructor: 'kaká',
    name: 'aula ao vivo com kaká',
    instructorImageUrl: '/preview.jpeg',
    checkInsQuantity: 8,
    checkInsMaxQuantity: 15,
    startDatetime: '2023-05-16T19:00',
    usersWhoCheckedIn,
  },
  {
    id: 2,
    instructor: 'kaká',
    name: 'aula ao vivo com kaká',
    instructorImageUrl: '/preview.jpeg',
    checkInsQuantity: 8,
    checkInsMaxQuantity: 15,
    startDatetime: '2023-05-18T19:00',
    usersWhoCheckedIn,
  },
  {
    id: 3,
    instructor: 'kaká',
    name: 'aula ao vivo com kaká',
    instructorImageUrl: '/preview.jpeg',
    checkInsQuantity: 8,
    checkInsMaxQuantity: 15,
    startDatetime: '2023-05-123T19:00',
    usersWhoCheckedIn,
  },
  {
    id: 4,
    instructor: 'kaká',
    name: 'aula ao vivo com kaká',
    instructorImageUrl: '/preview.jpeg',
    checkInsQuantity: 8,
    checkInsMaxQuantity: 15,
    startDatetime: '2023-05-25T19:00',
    usersWhoCheckedIn,
  },
  {
    id: 5,
    instructor: 'kaká',
    name: 'aula ao vivo com kaká',
    instructorImageUrl: '/preview.jpeg',
    checkInsQuantity: 8,
    checkInsMaxQuantity: 15,
    startDatetime: '2023-05-30T19:00',
    usersWhoCheckedIn,
  },
  {
    id: 6,
    instructor: 'kaká',
    name: 'aula ao vivo com kaká',
    instructorImageUrl: '/preview.jpeg',
    checkInsQuantity: 8,
    checkInsMaxQuantity: 15,
    startDatetime: '2023-02-01T19:00',
    usersWhoCheckedIn,
  },
  {
    id: 7,
    instructor: 'kaká',
    name: 'aula ao vivo com kaká',
    instructorImageUrl: '/preview.jpeg',
    checkInsQuantity: 8,
    checkInsMaxQuantity: 15,
    startDatetime: '2023-02-06T19:00',
    usersWhoCheckedIn,
  },
  {
    id: 8,
    instructor: 'kaká',
    name: 'aula ao vivo com kaká',
    instructorImageUrl: '/preview.jpeg',
    checkInsQuantity: 8,
    checkInsMaxQuantity: 15,
    startDatetime: '2023-02-08T19:00',
    usersWhoCheckedIn: [],
  },
];

export default function Calendar() {
  const today = startOfDay(new Date());
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(
    format(today, 'MMM-yyyy', {
      locale: ptBR,
    })
  );

  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', today, {
    locale: ptBR,
  });

  const days = eachDayOfInterval({
    start: startOfMonth(firstDayCurrentMonth),
    end: endOfMonth(firstDayCurrentMonth),
  });

  const selectedDatMeetings = events.filter((event) =>
    isSameDay(parseISO(event.startDatetime), selectedDay)
  );

  function nextMonth() {
    const firstDayNextMonth = addMonths(firstDayCurrentMonth, 1);

    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy', { locale: ptBR }));
  }

  function previousMonth() {
    const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', today, {
      locale: ptBR,
    });

    const firstDayPreviousMonth = addMonths(firstDayCurrentMonth, -1);

    setCurrentMonth(
      format(firstDayPreviousMonth, 'MMM-yyyy', { locale: ptBR })
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-2 lg:divide-x lg:divide-gray-200">
      <div className="lg:pr-14">
        <div className="flex items-center">
          <h2 className="flex-auto font-semibold text-gray-900">
            {format(firstDayCurrentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <button
            type="button"
            onClick={previousMonth}
            className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Previous month</span>
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Next month</span>
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-10 grid grid-cols-7 text-center text-xs leading-6 text-gray-500">
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
          <div>S</div>
        </div>
        <div className="mt-2 grid grid-cols-7 text-sm">
          {days.map((day, dayIdx) => (
            <div
              key={day.toString()}
              className={classNames(
                dayIdx > 6 && 'border-t border-gray-200',
                dayIdx === 0 && colStartClassByWeekDay[getDay(day)],
                'py-2'
              )}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedDay(day);
                }}
                className={classNames(
                  isSameDay(day, selectedDay) && 'text-white',
                  !isSameDay(day, selectedDay) &&
                    isToday(day) &&
                    'text-brand-purple-600',
                  !isSameDay(day, selectedDay) &&
                    !isToday(day) &&
                    isSameMonth(day, firstDayCurrentMonth) &&
                    'text-gray-900',
                  !isSameDay(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    'text-gray-400',
                  isSameDay(day, selectedDay) &&
                    isToday(day) &&
                    'bg-brand-purple-600',
                  isSameDay(day, selectedDay) && !isToday(day) && 'bg-gray-900',
                  !isSameDay(day, selectedDay) && 'hover:bg-gray-200',
                  (isSameDay(day, selectedDay) || isToday(day)) &&
                    'font-semibold',
                  'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
                )}
              >
                <time dateTime={format(day, 'dd-MM-yyyy')}>
                  {format(day, 'd')}
                </time>
              </button>
              <div className="mx-auto mt-1 h-1 w-1">
                {events.some((event) =>
                  isSameDay(parseISO(event.startDatetime), day)
                ) && (
                  <div className="h-1 w-1 rounded-full bg-brand-purple-500"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <section className="mt-12 lg:mt-0 lg:pl-8">
        <h2 className="font-semibold text-gray-900">
          calendário do dia{' '}
          <time dateTime={format(selectedDay, 'dd-MM-yyyy')}>
            {format(selectedDay, "dd 'de' MMMM, yyy", {
              locale: ptBR,
            })}
          </time>
        </h2>
        <ol className="mt-4 space-y-1 text-sm leading-6 text-gray-500">
          {selectedDatMeetings.length > 0 ? (
            selectedDatMeetings.map((event) => (
              <EventItem event={event} key={event.id} />
            ))
          ) : (
            <p>
              sem eventos para{' '}
              <time dateTime={format(selectedDay, 'dd-MM-yyyy')}>
                {format(selectedDay, "dd 'de' MMMM, yyy", {
                  locale: ptBR,
                })}
              </time>
            </p>
          )}
        </ol>
      </section>
    </div>
  );
}
