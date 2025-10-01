import { ScrollArea, ScrollBar } from '@components/ui/scroll-area';
import { Separator } from '@components/ui/separator';
import DailyRecommendation from './DailyRecommendation';
import YokaratsWidget from '@components/YokaratsWidget';
import { useNext7DailyRecommendations } from '@hooks/useDailyRecommendations';
import useUser from '@hooks/useUser';

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
    <div className="px-4 pt-8 md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          oie, {user.displayName} 👋🏽
        </h2>
        <div className="flex-shrink-0 lg:ml-6">
          <YokaratsWidget />
        </div>
      </div>
      {next7Recommendations.length > 0 && (
        <div className="mt-4 space-y-4">
          <Separator />
          <p className="text-muted-foreground">
            recomendações da semana para você :)
          </p>
          <div className="relative">
            <ScrollArea>
              <div className="flex space-x-4 pb-4">
                {next7Recommendations.map((recommendation) => (
                  <DailyRecommendation
                    key={recommendation.id}
                    event={recommendation.event}
                    recommendationDate={recommendation.date}
                    className="w-[250px]"
                    aspectRatio="youtube"
                    width={250}
                    height={250}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
