import { useState } from 'react';
import {
  useYokaratsRanking,
  type RankingEntry,
} from '@hooks/useYokaratsRanking';
import {
  Loader2,
  Trophy,
  Medal,
  Award,
  Flame,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import useUser from '@hooks/useUser';
import { Button } from '@components/ui/button';
import UserActivityDrawer from '@components/UserActivityDrawer';
import { type UserInfo } from '@hooks/useUserActivity';

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

// Earliest date we have records (adjust this to your platform's launch date)
const EARLIEST_YEAR = 2024;
const EARLIEST_MONTH = 1; // January

export default function YokaratsRanking() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data, isLoading } = useYokaratsRanking({
    month: selectedMonth,
    year: selectedYear,
  });

  const { user } = useUser();

  // Check if we're at the current month
  const isCurrentMonth =
    selectedMonth === currentDate.getMonth() + 1 &&
    selectedYear === currentDate.getFullYear();

  // Check if we're at the earliest month
  const isEarliestMonth =
    selectedMonth === EARLIEST_MONTH && selectedYear === EARLIEST_YEAR;

  const goToPreviousMonth = () => {
    if (isEarliestMonth) return;

    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (isCurrentMonth) return;

    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getMonthYearLabel = () => {
    const monthName = MONTHS[selectedMonth - 1];
    return `${monthName} - ${selectedYear}`;
  };

  const getRankIcon = (position: number) => {
    if (position === 1)
      return <Trophy className="h-5 w-5 text-yellow-400" strokeWidth={1.5} />;
    if (position === 2)
      return <Medal className="h-5 w-5 text-slate-400" strokeWidth={1.5} />;
    if (position === 3)
      return <Award className="h-5 w-5 text-orange-400" strokeWidth={1.5} />;
    return null;
  };

  const getRankBadgeColor = (position: number) => {
    if (position === 1)
      return 'bg-gradient-to-br from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200/50';
    if (position === 2)
      return 'bg-gradient-to-br from-slate-50 to-gray-50 text-slate-600 border-slate-200/50';
    if (position === 3)
      return 'bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600 border-orange-200/50';
    return 'bg-white text-gray-500 border-gray-200/50';
  };

  const isCurrentUser = (userId: string) => {
    return user?.id === userId;
  };

  const handleUserClick = (entry: RankingEntry) => {
    setSelectedUser({
      id: entry.userId,
      name: entry.userName,
      displayName: entry.userDisplayName,
      imageUrl: entry.userImageUrl,
    });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 md:px-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          🔥 yokarats
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          ranking dos praticantes mais ativos do mês
        </p>
      </div>

      {/* Month Navigator */}
      <div className="mb-6 flex items-center justify-center gap-6">
        <Button
          onClick={goToPreviousMonth}
          disabled={isEarliestMonth}
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full transition-all hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </Button>

        <div className="min-w-[220px] text-center">
          <p className="text-lg font-medium text-gray-700">
            {getMonthYearLabel()}
          </p>
        </div>

        <Button
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full transition-all hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      {/* Ranking List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : data?.ranking && data.ranking.length > 0 ? (
        <div className="space-y-2">
          {data.ranking.map((entry: RankingEntry, index: number) => {
            const position = index + 1;
            const isCurrentUserEntry = isCurrentUser(entry.userId);

            return (
              <button
                key={entry.userId}
                onClick={() => handleUserClick(entry)}
                className={`group flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isCurrentUserEntry
                    ? 'border-purple-200 bg-gradient-to-r from-purple-50/80 to-pink-50/40 shadow-sm hover:shadow-md'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                {/* Position */}
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border text-base font-medium shadow-sm ${getRankBadgeColor(
                    position
                  )}`}
                >
                  {getRankIcon(position) || position}
                </div>

                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="relative h-11 w-11 overflow-hidden rounded-full bg-gray-100 shadow-sm ring-1 ring-gray-200/50">
                    {entry.userImageUrl ? (
                      <Image
                        src={entry.userImageUrl}
                        alt={entry.userDisplayName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 text-base font-medium text-purple-600">
                        {entry.userDisplayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* User Name */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-base font-medium ${
                      isCurrentUserEntry ? 'text-purple-800' : 'text-gray-700'
                    }`}
                  >
                    {entry.userDisplayName}
                    {isCurrentUserEntry && (
                      <span className="ml-2 text-sm font-normal text-purple-500">
                        (você)
                      </span>
                    )}
                  </p>
                </div>

                {/* Active Days */}
                <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-1.5 shadow-sm ring-1 ring-orange-100/50">
                  <Flame className="h-4 w-4 text-orange-500" strokeWidth={2} />
                  <span className="font-semibold text-orange-700">
                    {entry.activeDays}
                  </span>
                  <span className="text-xs text-orange-600/80">
                    {entry.activeDays === 1 ? 'dia' : 'dias'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
            <Flame className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-gray-400">
            ainda não há dados para este período
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-10 rounded-2xl border border-purple-100/50 bg-gradient-to-br from-purple-50/30 to-pink-50/20 p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-medium text-purple-800">
          como funciona o yokarats?
        </h3>
        <ul className="space-y-2 text-xs leading-relaxed text-purple-700/80">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-purple-400">•</span>
            <span>
              um dia ativo = pelo menos uma aula gravada completa (80%+) ou uma
              aula ao vivo
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-purple-400">•</span>
            <span>
              múltiplas aulas no mesmo dia contam como apenas 1 dia ativo
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-purple-400">•</span>
            <span>o ranking é atualizado em tempo real</span>
          </li>
        </ul>
      </div>

      {/* User Activity Drawer */}
      <UserActivityDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        user={selectedUser}
        month={selectedMonth}
        year={selectedYear}
      />
    </div>
  );
}
