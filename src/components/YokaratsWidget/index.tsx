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

  if (isLoading || !data?.ranking || data.ranking.length === 0) {
    return null;
  }

  const leader = data.ranking[0];
  if (!leader) {
    return null;
  }
  const currentUserPosition = data.ranking.findIndex(
    (entry) => entry.userId === user?.id
  );
  const currentUserEntry =
    currentUserPosition !== -1 ? data.ranking[currentUserPosition] : null;

  return (
    <Link
      href="/yokarats"
      className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-2 py-3 shadow-sm transition-all hover:border-purple-200 hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        🔥
        <span className="text-sm font-medium text-gray-700">yokarats</span>
      </div>

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
          <span className="text-xs  font-semibold text-orange-600">
            {leader.activeDays} dias ativos
          </span>
          <span className="text-xs font-medium text-gray-600">
            {leader.userDisplayName}
          </span>
        </div>
      </div>

      {/* Current User */}
      {currentUserEntry && (
        <>
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
                {currentUserEntry.activeDays} dias ativos
              </span>
              <span className="text-xs font-medium text-gray-600">você</span>
            </div>
          </div>
        </>
      )}

      {!currentUserEntry && (
        <>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-400">
              ?
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">0 dias ativos</span>
              <span className="text-xs font-medium text-gray-600">você</span>
            </div>
          </div>
        </>
      )}
    </Link>
  );
}
