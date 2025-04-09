'use client';

import Image from 'next/image';
import { cn } from '@utils';
import { ScrollArea, ScrollBar } from '@components/ui/scroll-area';

interface Category {
  id: string;
  name: string;
  image: string;
  backgroundColor: string;
}

const categories: Category[] = [
  {
    id: 'yoga',
    name: 'Yoga',
    image: '/images/yoga.png',
    backgroundColor: 'bg-purple-50',
  },
  {
    id: 'meditation',
    name: 'Meditação',
    image: '/images/meditation.png',
    backgroundColor: 'bg-pink-50',
  },
  {
    id: 'functional-training',
    name: 'Funcional',
    image: '/images/functional-training.png',
    backgroundColor: 'bg-blue-50',
  },
  {
    id: 'warm-up',
    name: 'Aquecimento',
    image: '/images/warm-up.png',
    backgroundColor: 'bg-blue-50',
  },
];

export default function CategoryScroll() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold text-gray-900 md:text-xl">
          categorias
        </h2>
      </div>

      <ScrollArea className="w-full whitespace-nowrap rounded-lg">
        <div className="flex space-x-4 p-1">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <a
      href="#"
      className={cn(
        'inline-block min-w-[160px] overflow-hidden rounded-3xl transition-transform hover:scale-105',
        category.backgroundColor
      )}
    >
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={category.image || '/placeholder.svg'}
          alt={category.name}
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          <p className="text-md font-medium text-white">{category.name}</p>
        </div>
      </div>
    </a>
  );
}
