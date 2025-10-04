// components/RecommendationClass.tsx
import { Heart } from 'lucide-react';
import Link from 'next/link';

export interface Recommendation {
  id: string;
  name: string;
  teacher: string;
  tags: string[];
  imageUrl: string;
  href: string;
}

export interface RecommendationClassProps {
  title: string;
  actionLabel: string;
  onActionClick: () => void;
  recommendation: Recommendation;
  hideAction?: boolean;
}

export const RecommendationClassSection = ({
  title,
  actionLabel,
  onActionClick,
  hideAction = true,
  recommendation,
}: RecommendationClassProps) => {
  return (
    <section className="my-8 px-4 md:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {!hideAction && (
          <button
            className="text-sm font-medium text-blue-500 hover:underline"
            onClick={onActionClick}
          >
            {actionLabel}
          </button>
        )}
      </div>

      {/* Desktop Layout */}
      <Link
        href={recommendation.href}
        className="group mt-4 hidden cursor-pointer md:block md:w-52"
      >
        <div className="relative aspect-video overflow-hidden rounded-xl">
          <img
            src={recommendation.imageUrl}
            alt={recommendation.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {/* <div className="flex items-center justify-between mt-2"> */}
        <div className="relative mt-2 flex flex-row items-center justify-between overflow-hidden md:w-full">
          <h3 className="max-w-42 animate-scroll-text overflow-hidden whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100 md:animate-no-scroll-text">
            {recommendation.name}
          </h3>
          <button className="whitespace-nowrap text-gray-500 hover:text-red-500">
            <Heart className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-1 flex gap-2">
          {recommendation.tags.map((tag, index) => (
            <span
              key={index}
              className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>

      {/* Mobile Layout */}
      <Link
        href={recommendation.href}
        className="mt-4 flex cursor-pointer overflow-hidden rounded-xl bg-gray-100 p-3 dark:bg-gray-800 md:hidden"
      >
        <div className="mr-3 aspect-[16/9] w-24 overflow-hidden rounded-lg shadow-sm">
          <img
            src={recommendation.imageUrl}
            alt={recommendation.name}
            className="w-24 object-cover"
          />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
              {recommendation.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              With {recommendation.teacher}
            </p>
          </div>
          <button className="text-gray-500 hover:text-red-500">
            <Heart />
          </button>
        </div>
      </Link>
    </section>
  );
};
