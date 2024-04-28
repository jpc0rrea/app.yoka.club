import { useState } from 'react';
import DeleteEventModal from '@components/Modals/DeleteEventAlert';
import EditEventModal from '@components/Modals/EditEventModal';
import EditRecordedEventUrlModal from '@components/Modals/EditRecordedEventUrlModal';
import UpdateAttendanceModal from '@components/Modals/UpdateAttendanceModal';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { classNames } from '@lib/utils';
import { EventFromAPI } from '@models/events/types';
import eventUtils from '@models/events/utils';
import { isAfter, format } from 'date-fns';
import { Pencil, Trash2, UserCheck, Ellipsis } from 'lucide-react';

interface EventInManageSectionProps {
  event: EventFromAPI;
}

const eventStatuses = {
  publicado: 'text-green-700 bg-green-50 ring-green-600/20',
  'sem link': 'text-red-600 bg-red-50 ring-red-500/10',
  agendado: 'text-yellow-800 bg-yellow-50 ring-yellow-600/20',
};

export default function EventInManageSection({
  event,
}: EventInManageSectionProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateAttendanceModalOpen, setIsUpdateAttendanceModalOpen] =
    useState(false);

  const eventHasStarted = eventUtils.hasStarted({ event });

  const eventStatus =
    event.isLive && event.startDate
      ? isAfter(new Date(), new Date(event.startDate))
        ? event.recordedUrl
          ? 'publicado'
          : 'sem link'
        : 'agendado'
      : 'publicado';

  return (
    <li
      key={event.id}
      className="flex items-center justify-between gap-x-6 py-5"
    >
      <EditEventModal
        open={isEditModalOpen}
        setOpen={setIsEditModalOpen}
        event={event}
      />
      <DeleteEventModal
        open={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        event={event}
      />
      <UpdateAttendanceModal
        open={isUpdateAttendanceModalOpen}
        setOpen={setIsUpdateAttendanceModalOpen}
        event={event}
      />
      <div className="min-w-0">
        <div className="flex items-start gap-x-3">
          <a
            href={`/events/${event.id}`}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            {event.title}
          </a>
          <p
            className={classNames(
              eventStatuses[eventStatus],
              'mt-0.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset'
            )}
          >
            {eventStatus}
          </p>
        </div>
        <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
          {event.isLive && event.startDate && (
            <p className="whitespace-nowrap">
              {eventStatus === 'agendado' ? 'acontecerá' : 'aconteceu'} em{' '}
              <strong>
                {format(new Date(event.startDate), "dd/MM/yyyy' às 'HH:mm")}
              </strong>
            </p>
          )}
          <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
            <circle cx={1} cy={1} r={1} />
          </svg>
          <p className="truncate">
            comandado por {event.instructor.displayName}
          </p>
        </div>
      </div>
      <div className="flex flex-none items-center gap-x-4">
        {((event.startDate && isAfter(new Date(), new Date(event.startDate))) ||
          !event.isLive) && (
          <EditRecordedEventUrlModal
            eventId={event.id}
            recordedUrl={event.recordedUrl || undefined}
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <Ellipsis className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem
              onClick={() => {
                setIsEditModalOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              editar
            </DropdownMenuItem>
            {eventHasStarted && (
              <DropdownMenuItem
                onClick={() => {
                  setIsUpdateAttendanceModalOpen(true);
                }}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                presença
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                setIsDeleteModalOpen(true);
              }}
              className="text-red-400 focus:bg-red-100 focus:text-red-500"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              deletar evento
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}
