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
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EventItem from './EventItem';
import { useEvents } from '@hooks/useEvents';

const colStartClassByWeekDay = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];

export default function Calendar() {
  const today = startOfDay(new Date());
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(
    format(today, 'MMM-yyyy', {
      locale: ptBR,
    })
  );

  const { data: events } = useEvents({
    isLive: true,
    enabled: true,
    pageSize: 1000,
  });

  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', today, {
    locale: ptBR,
  });

  const days = eachDayOfInterval({
    start: startOfMonth(firstDayCurrentMonth),
    end: endOfMonth(firstDayCurrentMonth),
  });

  const selectedDayMeetings = events
    ? events.filter(
        (event) =>
          event.startDate && isSameDay(new Date(event.startDate), selectedDay)
      )
    : [];

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
          <div>dom.</div>
          <div>seg.</div>
          <div>ter.</div>
          <div>qua.</div>
          <div>qui.</div>
          <div>sex.</div>
          <div>sáb.</div>
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
                    'bg-brand-purple-700',
                  isSameDay(day, selectedDay) &&
                    !isToday(day) &&
                    'bg-purple-700',
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
                {events &&
                  events.some(
                    (event) =>
                      event.startDate &&
                      isSameDay(new Date(event.startDate), day)
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
          eventos do dia{' '}
          <time dateTime={format(selectedDay, 'dd-MM-yyyy')}>
            {format(selectedDay, "dd 'de' MMMM, yyy", {
              locale: ptBR,
            })}
          </time>
        </h2>
        <ol className="mt-4 space-y-1 text-sm leading-6 text-gray-500">
          {selectedDayMeetings.length > 0 ? (
            selectedDayMeetings.map((event) => (
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
