'use client';

import type React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@utils';
import Link from 'next/link';
import DurationBadge from '@components/reusables/DurationBadge';
import IsPremiumBadge from '@components/reusables/IsPremiumBadge';
import getYouTubeThumbnailURL from '@lib/utilities/getYouTubeThumbnailURL';
import { Prisma } from '@prisma/client';
import FavoriteButton from '@components/reusables/FavoriteButton';
import { useRouter } from 'next/router';

interface ClassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  event: Prisma.EventGetPayload<{
    include: {
      instructor: {
        select: {
          displayName: true;
        };
      };
    };
  }>;
  recommendationDate: Date;
  aspectRatio?: 'youtube' | 'square';
  width?: number;
  height?: number;
  onLike?: () => void;
}

export default function ClassCard({
  event,
  recommendationDate,
  aspectRatio = 'square',
  width = 150,
  height = 150,
  onLike,
  className,
}: ClassCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const router = useRouter();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked(!isLiked);
    onLike?.();
  };

  if (!event || !event.recordedUrl) {
    return null;
  }

  const thumbnailUrl = getYouTubeThumbnailURL(event.recordedUrl);

  return (
    <div className={cn('w-full cursor-pointer', className)}>
      <div className="mb-4 flex w-full items-center justify-between">
        <h2 className="text-md font-semibold text-gray-900 md:text-xl">
          recomendação do dia
        </h2>
        <Link
          href="/recorded-classes"
          className="text-sm text-brand-yoka-purple-700 hover:underline"
        >
          mostrar mais
        </Link>
      </div>

      <div
        className="flex w-full items-center rounded-2xl bg-brand-yoka-purple-neutral-100 p-2 shadow-sm transition-shadow duration-200 hover:shadow-md"
        onClick={() => {
          router.push(`/events/${event.id}`);
        }}
      >
        {/* Thumbnail */}
        <div className="relative h-20 w-20 flex-shrink-0 ">
          <Image
            src={thumbnailUrl}
            alt={event.title}
            fill
            className="rounded-xl object-cover object-right"
            priority
          />
        </div>

        {/* Content */}
        <div className="flex w-full items-center justify-between pl-4">
          <div>
            <div className="relative w-[50vw] overflow-hidden md:w-full">
              <h3 className="animate-scroll-text whitespace-nowrap font-medium text-gray-900 md:animate-no-scroll-text">
                {event.title}
              </h3>
              <p className="whitespace-nowrap text-xs text-gray-500 md:text-sm">
                com {event.instructor.displayName}
              </p>
            </div>
            <div className="mb-2 flex flex-wrap gap-2">
              <DurationBadge duration={event.duration} style="simple" />
              <IsPremiumBadge isPremium={event.isPremium} style="simple" />
            </div>
          </div>
          <div
            className="ml-4 md:ml-0"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <FavoriteButton eventId={event.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
