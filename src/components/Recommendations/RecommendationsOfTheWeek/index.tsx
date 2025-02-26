import { ScrollArea, ScrollBar } from '@components/ui/scroll-area';
import { Separator } from '@components/ui/separator';
import DailyRecommendation from './DailyRecommendation';
import { useNext7DailyRecommendations } from '@hooks/useDailyRecommendations';
import useUser from '@hooks/useUser';
import ClassCard from '@components/Card/class-card';
import CategoryScroll from '@components/Category';

export default function RecommendationsOfTheWeek() {
  const { data: next7Recommendations } = useNext7DailyRecommendations();

  const { user } = useUser();

  if (!user) {
    return null;
  }

  if (!next7Recommendations) {
    return null;
  }

  return (
    <div className="px-2 sm:px-4 md:px-4 xl:px-8 pt-4 md:pt-12">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
        oie, {user.displayName} 👋🏽
      </h2>
      {next7Recommendations.length > 0 && next7Recommendations[0] && (
        <div className="mt-1 space-y-1 lg:space-y-4">
          <Separator />
          <div className="relative">
            <ScrollArea>
              <div className="flex space-x-4 pb-4 max-w-[100vw] md:max-w-2xl">
                <ClassCard
                    key={next7Recommendations[0].id}
                    event={next7Recommendations[0].event}
                    recommendationDate={next7Recommendations[0].date}
                    className="w-[100%]"
                    aspectRatio="youtube"
                    width={250}
                    height={250}
                  />
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      )}

      <div className="mt-1 space-y-1 lg:space-y-4">
          <Separator />
          <CategoryScroll />
        </div>
      
    </div>
  );
}
