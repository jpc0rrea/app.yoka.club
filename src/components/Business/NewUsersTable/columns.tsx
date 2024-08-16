import { ColumnDef } from '@tanstack/react-table';
import { NewUsers } from '@hooks/useBusinessInformations';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@components/ui/dropdown-menu';
import { Button } from '@components/ui/button';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDown } from 'lucide-react';

export const columns: ColumnDef<NewUsers>[] = [
  {
    accessorKey: 'displayName',
    header: 'nome',
  },
  {
    accessorKey: 'watchedEventsCount',
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
                <span>aulas assistidas</span>
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
                asc
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                desc
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
  {
    accessorKey: 'daysUsingApp',
    header: 'dias usados',
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-2">
          {row.original.daysUsingApp.length}
        </div>
      );
    },
  },
];
