// components/TrailsSection.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

interface Trail {
  id: string;
  imageUrl: string;
  href: string;
}

export interface TrailsSectionProps {
  title: string;
  actionLabel: string;
  onActionClick: () => void;
  hideAction?: boolean;
  hideTitle?: boolean;
  trails: Trail[];
}

export const TrailsSection = ({
  title,
  actionLabel,
  onActionClick,
  hideTitle = false,
  hideAction = false,
  trails,
}: TrailsSectionProps) => {
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
  }, []);

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
    <section>
      <div className="mb-4 flex w-full items-center justify-between">
        {!hideTitle && (
          <h2 className="text-md font-semibold text-gray-900 md:text-xl">
            {title}
          </h2>
        )}
        {!hideAction && (
          <a
            className="text-sm text-brand-yoka-purple-700 hover:underline"
            onClick={onActionClick}
            href="#recorded-classes-section"
          >
            {actionLabel}
          </a>
        )}
      </div>

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
          {trails.map((trail) => (
            <Link
              key={trail.id}
              href={trail.href}
              className="aspect-[9/16] w-40 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl bg-gray-200 transition-transform duration-300 hover:scale-105 md:w-52"
            >
              <img
                src={trail.imageUrl}
                alt="Trail Cover"
                className="h-full w-full object-cover"
              />
            </Link>
          ))}
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
    </section>
  );
};
