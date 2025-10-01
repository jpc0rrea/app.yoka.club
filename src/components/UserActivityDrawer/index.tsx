import { useState } from 'react';
import { useUserActivity, type UserInfo } from '@hooks/useUserActivity';
import {
  Calendar,
  Play,
  Users,
  Clock,
  CheckCircle,
  Loader2,
  Flame,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@components/ui/sheet';
import { getYouTubeThumbnailWithFallback } from '@lib/utilities/getYouTubeThumbnailURL';

interface UserActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserInfo | null;
  month: number;
  year: number;
}

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

export default function UserActivityDrawer({
  isOpen,
  onClose,
  user,
  month,
  year,
}: UserActivityDrawerProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleClose = () => {
    setSelectedDate(null); // Reset selected date
    onClose();
  };

  const { data, isLoading } = useUserActivity({
    userId: user?.id || '',
    month,
    year,
    enabled: isOpen && !!user,
  });

  const getMonthYearLabel = () => {
    const monthName = MONTHS[month - 1];
    return `${monthName} - ${year}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    // Parse the date string as UTC to avoid timezone issues
    const parts = dateString.split('-').map(Number);
    const [year, month, day] = parts;
    if (year && month && day) {
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
      });
    }
    return dateString; // Fallback to original string
  };

  const getCalendarDays = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${month.toString().padStart(2, '0')}-${day
        .toString()
        .padStart(2, '0')}`;
      const hasActivity = data?.activities.some(
        (activity) => activity.date === dateString
      );
      days.push({
        day,
        dateString,
        hasActivity,
        isSelected: selectedDate === dateString,
      });
    }

    return days;
  };

  const getSelectedDateActivities = () => {
    if (!selectedDate || !data) return [];
    return (
      data.activities.find((activity) => activity.date === selectedDate)
        ?.activities || []
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="right"
        className="flex w-full max-w-2xl flex-col sm:max-w-2xl"
      >
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-center gap-4">
            {user?.imageUrl ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                <Image
                  src={user.imageUrl}
                  alt={user.displayName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-semibold text-purple-600">
                {user?.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <SheetTitle className="text-left text-xl font-semibold text-gray-900">
                {user?.displayName}
              </SheetTitle>
              <p className="text-sm text-gray-500">{getMonthYearLabel()}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="space-y-6 pb-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 p-4 text-center">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="text-2xl font-bold text-gray-900">
                      {data?.totalActiveDays || 0}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">dias ativos</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 text-center">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <span className="text-2xl font-bold text-gray-900">
                      {data?.activities.reduce(
                        (total, day) => total + day.activities.length,
                        0
                      ) || 0}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">total de aulas</p>
                </div>
              </div>

              {/* Calendar */}
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                  calendário de atividades
                </h3>
                <div className="rounded-lg border border-gray-200 p-4">
                  {/* Calendar header */}
                  <div className="mb-4 grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(
                      (day) => (
                        <div key={day} className="p-2">
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays().map((day, index) => (
                      <div key={index} className="aspect-square">
                        {day ? (
                          <button
                            onClick={() => setSelectedDate(day.dateString)}
                            className={`h-full w-full rounded-lg text-sm transition-all ${
                              day.hasActivity
                                ? day.isSelected
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                : day.isSelected
                                ? 'bg-gray-200 text-gray-900'
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {day.day}
                          </button>
                        ) : (
                          <div />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Date Activities */}
              {selectedDate && (
                <div>
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    atividades de {formatDate(selectedDate)}
                  </h3>
                  <div className="space-y-3">
                    {getSelectedDateActivities().length > 0 ? (
                      getSelectedDateActivities().map((activity, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          {/* Mobile-first layout */}
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            {/* Event Thumbnail or Icon */}
                            <div className="flex-shrink-0">
                              {activity.eventThumbnail ? (
                                <div className="relative h-20 w-32 overflow-hidden rounded-lg bg-gray-100 sm:h-16 sm:w-24">
                                  <Image
                                    src={
                                      getYouTubeThumbnailWithFallback(
                                        activity.eventThumbnail || ''
                                      ).fallbackSrc
                                    }
                                    alt={activity.eventTitle}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                      // If image fails to load, hide the image and show the overlay with icon
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    {activity.type === 'live' ? (
                                      <Users className="h-6 w-6 text-white sm:h-5 sm:w-5" />
                                    ) : (
                                      <Play className="h-6 w-6 text-white sm:h-5 sm:w-5" />
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={`flex h-20 w-32 items-center justify-center rounded-lg sm:h-16 sm:w-24 ${
                                    activity.type === 'live'
                                      ? 'border border-green-200 bg-gradient-to-br from-green-100 to-emerald-100'
                                      : 'border border-blue-200 bg-gradient-to-br from-blue-100 to-indigo-100'
                                  }`}
                                >
                                  {activity.type === 'live' ? (
                                    <div className="flex flex-col items-center">
                                      <Users className="mb-1 h-8 w-8 text-green-600 sm:h-6 sm:w-6" />
                                      <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
                                        <span className="text-xs font-medium text-green-700">
                                          AO VIVO
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <Play className="h-10 w-10 text-blue-600 sm:h-8 sm:w-8" />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Content - Full width on mobile, flex-1 on desktop */}
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/events/${activity.eventId}`}
                                className="group block"
                              >
                                <p className="font-medium text-gray-900 transition-colors group-hover:text-purple-600">
                                  {activity.eventTitle}
                                </p>
                              </Link>
                              <p className="mt-1 text-sm text-gray-500">
                                com {activity.instructorName}
                              </p>
                            </div>

                            {/* Metadata - Full width on mobile, compact on desktop */}
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 sm:flex-nowrap sm:gap-3">
                              <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">
                                  {formatDuration(activity.duration)}
                                </span>
                              </div>

                              {activity.type === 'live' &&
                                activity.attended && (
                                  <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-green-600">
                                    <CheckCircle className="h-3 w-3" />
                                    <span className="text-xs">compareceu</span>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                        <p>nenhuma atividade neste dia</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
