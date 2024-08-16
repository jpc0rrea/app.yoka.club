import { ColumnDef } from '@tanstack/react-table';
import { WatchedEvents } from '@hooks/useBusinessInformations';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@components/ui/dropdown-menu';
import { Button } from '@components/ui/button';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDown } from 'lucide-react';

export const columns: ColumnDef<WatchedEvents>[] = [
  {
    accessorKey: 'title',
    header: 'Título',
  },
  {
    accessorKey: 'watchedTimes',
    header: ({ column }) => {
      return (
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 min-w-max focus-visible:ring-transparent data-[state=open]:bg-accent"
              >
                <span>Vezes assistidas</span>
                {column.getIsSorted() === 'desc' ? (
                  <ArrowDownIcon className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === 'asc' ? (
                  <ArrowUpIcon className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Asc
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Desc
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
  {
    accessorKey: 'usersThatWatched',
    header: 'Usuários que assistiram',
    cell: ({ row }) => {
      const usersThatWatched = row.original.usersThatWatched;
      return (
        <div className="flex flex-wrap gap-2">
          {usersThatWatched.map((user) => (
            <div
              key={user.userId}
              className="rounded-full bg-gray-200 px-2 py-1 text-xs"
            >
              {user.displayName}
            </div>
          ))}
        </div>
      );
    },
  },
];
