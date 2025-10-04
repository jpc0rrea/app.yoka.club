import { useYokaratsRanking } from '@hooks/useYokaratsRanking';
import useUser from '@hooks/useUser';
import Image from 'next/image';
import Link from 'next/link';

export default function YokaratsWidget() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { user } = useUser();
  const { data, isLoading } = useYokaratsRanking({
    month: currentMonth,
    year: currentYear,
  });

  const getMonthYearLabel = () => {
    const months = [
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
    const monthName = months[currentMonth - 1];
    return `${monthName} - ${currentYear}`;
  };

  // Show empty state when there's no data
  if (isLoading || !data?.ranking || data.ranking.length === 0) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-2 py-3 shadow-sm">
        {/* Title and Month */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            🔥
            <span className="text-sm font-medium text-gray-700">yokarats</span>
          </div>
          <span className="text-xs text-gray-500">{getMonthYearLabel()}</span>
        </div>

        {/* Empty State */}
        <div className="flex items-center justify-center py-2 text-center">
          <span className="text-xs text-gray-400">
            {isLoading
              ? 'carregando...'
              : 'nenhuma aula realizada. faça uma prática pra começar'}
          </span>
        </div>
      </div>
    );
  }

  const leader = data.ranking[0];
  if (!leader) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-2 py-3 shadow-sm">
        {/* Title and Month */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            🔥
            <span className="text-sm font-medium text-gray-700">yokarats</span>
          </div>
          <span className="text-xs text-gray-500">{getMonthYearLabel()}</span>
        </div>

        {/* Empty State */}
        <div className="flex items-center justify-center py-2">
          <span className="text-xs text-gray-400">
            nenhuma atividade este mês
          </span>
        </div>
      </div>
    );
  }
  const currentUserPosition = data.ranking.findIndex(
    (entry) => entry.userId === user?.id
  );
  const currentUserEntry =
    currentUserPosition !== -1 ? data.ranking[currentUserPosition] : null;

  return (
    <Link
      href="/yokarats"
      className="group flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-2 py-3 shadow-sm transition-all hover:border-purple-200 hover:shadow-md"
    >
      {/* Title and Month */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          🔥
          <span className="text-sm font-medium text-gray-700">yokarats</span>
        </div>
        <span className="text-xs text-gray-500">{getMonthYearLabel()}</span>
      </div>

      {/* Leader and User */}
      <div className="flex items-center gap-4">
        {/* Leader */}
        <div className="flex items-center gap-2">
          {leader.userImageUrl ? (
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image
                src={leader.userImageUrl}
                alt={leader.userDisplayName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-600">
              {leader.userDisplayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-orange-600">
              {leader.activeDays}{' '}
              {leader.activeDays === 1 ? 'dia ativo' : 'dias ativos'}
            </span>
            <span className="text-xs font-medium text-gray-600">
              {leader.userDisplayName}
            </span>
          </div>
        </div>

        {/* Current User */}
        {currentUserEntry && (
          <>
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              {currentUserEntry.userImageUrl ? (
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image
                    src={currentUserEntry.userImageUrl}
                    alt={currentUserEntry.userDisplayName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-600">
                  {currentUserEntry.userDisplayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-purple-600">
                  {currentUserEntry.activeDays}{' '}
                  {currentUserEntry.activeDays === 1
                    ? 'dia ativo'
                    : 'dias ativos'}
                </span>
                <span className="text-xs font-medium text-gray-600">você</span>
              </div>
            </div>
          </>
        )}

        {!currentUserEntry && user && (
          <>
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              {user.imageUrl ? (
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image
                    src={user.imageUrl}
                    alt={user.name || 'Você'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-600">
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">0 dias ativos</span>
                <span className="text-xs font-medium text-gray-600">você</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
