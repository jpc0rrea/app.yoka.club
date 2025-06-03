import { Skeleton } from '@components/ui/skeleton';
import { EventFromAPI } from '@models/events/types';
import EventCard from './EventCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface ClassesSectionProps {
  events?: EventFromAPI[];
  isLoading: boolean;
}

export default function ClassesSectionDashboard({
  events,
  isLoading,
}: ClassesSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Check if can scroll left
    setCanScrollLeft(container.scrollLeft > 0);

    // Check if can scroll right
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    // Initial check
    checkScrollButtons();

    // Add scroll event listener
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      // Check on window resize as well
      window.addEventListener('resize', checkScrollButtons);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      }
    };
  }, [events]);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const newPosition =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative mt-4">
      {/* Desktop Navigation Buttons */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 cursor-pointer rounded-full bg-purple-800 bg-opacity-50 p-2 text-white md:flex"
        >
          <ChevronLeft />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto overflow-y-hidden px-4 md:px-8"
      >
        {isLoading || !events ? (
          Array.from({ length: 10 }, (_, index) => (
            <Skeleton key={index} className="h-64 w-64 flex-shrink-0 md:w-80" />
          ))
        ) : events.length === 0 ? (
          <p className="text-sm text-gray-500 md:text-base">
            nenhum evento foi encontrado com esses filtros :(
          </p>
        ) : (
          events.map((event) => {
            return (
              <div key={event.id} className="max-w-64 flex-none">
                <EventCard event={event} />
              </div>
            );
          })
        )}
      </div>

      {canScrollRight && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 cursor-pointer rounded-full bg-purple-800 bg-opacity-50 p-2 text-white md:flex"
        >
          <ChevronRight />
        </button>
      )}
    </div>
  );
}
