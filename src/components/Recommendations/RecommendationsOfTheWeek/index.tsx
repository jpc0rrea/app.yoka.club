import { ScrollArea, ScrollBar } from '@components/ui/scroll-area';
import { Separator } from '@components/ui/separator';
import DailyRecommendation from './DailyRecommendation';
import { useDailyRecommendations } from '@hooks/useDailyRecommendations';
import { endOfWeek, startOfDay } from 'date-fns';
import useUser from '@hooks/useUser';

export default function RecommendationsOfTheWeek() {
  const { data: recommendationsOfTheWeek } = useDailyRecommendations({
    startDate: startOfDay(new Date()),
    endDate: endOfWeek(new Date()),
  });

  const { user } = useUser();

  if (!user) {
    return null;
  }

  if (!recommendationsOfTheWeek) {
    return null;
  }
  return (
    <div className="px-8 pt-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          oie, {user.displayName}
        </h2>
        <p className="text-sm text-muted-foreground">
          recomendações da semana para você :)
        </p>
      </div>
      <Separator className="my-4" />
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {recommendationsOfTheWeek.map((recommendation) => (
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
  );
}
