import Link from 'next/link';
import { TrailFromAPI } from '@models/trails/types';

interface TrailCardProps {
  trail: TrailFromAPI;
}

export default function TrailCard({ trail }: TrailCardProps) {
  return (
    <Link
      href={`/trails/${trail.id}`}
      className="group block overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-all duration-200 hover:shadow-md hover:ring-gray-300"
    >
      <div className="flex">
        {/* Left column - Trail cover image with 9:16 aspect ratio */}
        <div className="aspect-[9/16] w-32 flex-shrink-0 overflow-hidden bg-gray-100 sm:w-40">
          <img
            src={trail.coverImageUrl}
            alt={trail.title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>

        {/* Right column - Trail information */}
        <div className="flex flex-1 flex-col justify-start p-4 sm:p-6">
          {/* First line - Trail title */}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 sm:text-xl">
            {trail.title}
          </h3>

          {/* Second line - Trail description */}
          {trail.description && (
            <p className="mt-2 line-clamp-6 text-xs text-gray-600 sm:text-sm">
              {trail.description}
            </p>
          )}

          {/* Additional info - Number of events */}
          <div className="mt-auto flex items-center text-xs text-gray-500 sm:text-sm">
            <span>
              {trail.trailEvents.length} aula
              {trail.trailEvents.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
