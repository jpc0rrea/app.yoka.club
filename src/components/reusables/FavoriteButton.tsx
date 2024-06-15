import { errorToast } from '@components/Toast/ErrorToast';
import { successToast } from '@components/Toast/SuccessToast';
import { Button } from '@components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip';
import useUser from '@hooks/useUser';
import { api } from '@lib/api';
import { queryClient } from '@lib/queryClient';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  eventId: string;
}

export default function FavoriteButton({ eventId }: FavoriteButtonProps) {
  const { user, setFavoriteEvents, favoriteEvents } = useUser();

  if (!user) {
    return null;
  }

  const isFavorite = favoriteEvents.includes(eventId);

  const addToFavorites = () => {
    try {
      setFavoriteEvents([...favoriteEvents, eventId]);

      api.post(`/user/favorites?eventId=${eventId}`);

      queryClient.invalidateQueries(['recordedEvents']);

      successToast({
        message: 'evento adicionado aos favoritos :)',
      });
    } catch (err) {
      console.log(err);

      setFavoriteEvents(favoriteEvents.filter((id) => id !== eventId));

      errorToast({
        message: 'erro ao adicionar evento aos favoritos :(',
      });
    }
  };

  const removeFromFavorites = () => {
    try {
      setFavoriteEvents(favoriteEvents.filter((id) => id !== eventId));

      api.delete(`/user/favorites?eventId=${eventId}`);

      queryClient.invalidateQueries(['recordedEvents']);

      successToast({
        message: 'evento removido dos favoritos',
      });
    } catch (err) {
      console.log(err);

      setFavoriteEvents([...favoriteEvents, eventId]);

      errorToast({
        message: 'erro ao remover evento dos favoritos :(',
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="icon"
            size="xs"
            className="hover:cursor-auto"
            onClick={() => {
              if (isFavorite) {
                removeFromFavorites();
              } else {
                addToFavorites();
              }
            }}
          >
            <Heart
              className={`h-4 w-4 text-brand-purple-800 transition-all duration-300 hover:cursor-pointer ${
                isFavorite
                  ? 'fill-brand-purple-800 hover:fill-brand-purple-900'
                  : 'fill-transparent hover:fill-brand-purple-600'
              }`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
