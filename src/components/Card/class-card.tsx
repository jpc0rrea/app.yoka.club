"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { cn } from "@utils"
import Link from "next/link"
import DurationBadge from '@components/reusables/DurationBadge'
import IsPremiumBadge from '@components/reusables/IsPremiumBadge'
import getYouTubeThumbnailURL from '@lib/utilities/getYouTubeThumbnailURL'
import { Prisma } from '@prisma/client'
import FavoriteButton from "@components/reusables/FavoriteButton"
import { useRouter } from "next/router"

interface ClassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  event: Prisma.EventGetPayload<{
    include: {
      instructor: {
        select: {
          displayName: true,
        };
      };
    };
  }>
  recommendationDate: Date
  aspectRatio?: 'youtube' | 'square'
  width?: number
  height?: number
  onLike?: () => void
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
    e.preventDefault()
    setIsLiked(!isLiked)
    onLike?.()
  }

  if (!event || !event.recordedUrl) {
    return null
  }

  const thumbnailUrl = getYouTubeThumbnailURL(event.recordedUrl)

  return (
    <div className={cn("w-full cursor-pointer", className)}>
      <div className="flex justify-between items-center mb-4 w-full">
        <h2 className="text-md md:text-xl font-semibold text-gray-900">recomendação do dia</h2>
        <Link href="#recorded-classes-section"
          className="text-brand-yoka-purple-700 text-sm hover:underline">
          mostrar mais
        </Link>
      </div>

      <div className="flex items-center rounded-2xl p-2 shadow-sm hover:shadow-md transition-shadow duration-200 bg-brand-yoka-purple-neutral-100 w-full" onClick={
      () => {
        router.push(`/events/${event.id}`)
      }
    }>
        {/* Thumbnail */}
        <div className="relative h-20 w-20 flex-shrink-0 ">
          <Image
            src={thumbnailUrl}
            alt={event.title}
            fill
            className="object-cover rounded-xl"
            priority
          />
        </div>

        {/* Content */}
        <div className="pl-4 flex items-center justify-between w-full">
          <div>
            <div className="relative w-[50vw] md:w-full overflow-hidden">
              <h3 className="font-medium text-gray-900 whitespace-nowrap animate-scroll-text md:animate-no-scroll-text">{event.title}</h3>
              <p className="md:text-sm text-gray-500 text-xs whitespace-nowrap">com {event.instructor.displayName}</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <DurationBadge duration={event.duration} style="simple" />
              <IsPremiumBadge isPremium={event.isPremium} style="simple" />
            </div>
          </div>
          <div className="ml-4 md:ml-0" onClick={
            (e) => {
              e.stopPropagation();
            }
          }>
            <FavoriteButton eventId={event.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
