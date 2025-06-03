import { TrailFromAPI } from '@models/trails/types';
import { Button } from '@components/ui/button';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EditTrailModal from '@components/Modals/EditTrailModal';
import DeleteTrailModal from '@components/Modals/DeleteTrailModal';

interface TrailInManageSectionProps {
  trail: TrailFromAPI;
}

export default function TrailInManageSection({
  trail,
}: TrailInManageSectionProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <li className="flex items-center justify-between gap-x-6 py-5">
        <div className="flex min-w-0 gap-x-4">
          <img
            className="h-12 w-12 flex-none rounded-lg bg-gray-50 object-cover"
            src={trail.coverImageUrl}
            alt={trail.title}
          />
          <div className="min-w-0 flex-auto">
            <p className="text-sm font-semibold leading-6 text-gray-900">
              {trail.title}
            </p>
            {trail.description && (
              <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                {trail.description}
              </p>
            )}
            <p className="mt-1 text-xs leading-5 text-gray-500">
              {trail.trailEvents.length} evento
              {trail.trailEvents.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-none items-center gap-x-4">
          <div className="hidden sm:flex sm:flex-col sm:items-end">
            <p className="text-sm leading-6 text-gray-900">
              Criada em{' '}
              {format(new Date(trail.createdAt), 'dd/MM/yyyy', {
                locale: ptBR,
              })}
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Atualizada em{' '}
              {format(new Date(trail.updatedAt), 'dd/MM/yyyy', {
                locale: ptBR,
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </li>

      <EditTrailModal
        trail={trail}
        open={isEditModalOpen}
        setOpen={setIsEditModalOpen}
      />

      <DeleteTrailModal
        trail={trail}
        open={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
      />
    </>
  );
}
