import { User } from '@prisma/client';
import { CircleMinus, CirclePlus, Ellipsis, RotateCcw } from 'lucide-react';
import { formatPhoneNumberIntl } from 'react-phone-number-input';

import AddMoreCheckInsToUser from '@components/Modals/AddMoreCheckInsToUser';
import RemoveCheckInsFromUser from '@components/Modals/RemoveCheckInsFromUser';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { useState } from 'react';
import ResetUserPasswordAlert from '@components/Modals/ResetUserPasswordAlert';

interface UserRowProps {
  user: User;
}

export default function UserRow({ user }: UserRowProps) {
  const [isResetUserPasswordModalOpen, setIsResetUserPasswordModalOpen] =
    useState(false);
  const [isRemovingCheckInsModalOpen, setIsRemovingCheckInsModalOpen] =
    useState(false);
  const [isAddingCheckInsModalOpen, setIsAddingCheckInsModalOpen] =
    useState(false);

  return (
    <tr key={user.email}>
      <ResetUserPasswordAlert
        open={isResetUserPasswordModalOpen}
        setOpen={setIsResetUserPasswordModalOpen}
        user={user}
      />
      <RemoveCheckInsFromUser
        userId={user.id}
        open={isRemovingCheckInsModalOpen}
        setOpen={setIsRemovingCheckInsModalOpen}
      />
      <AddMoreCheckInsToUser
        userId={user.id}
        open={isAddingCheckInsModalOpen}
        setOpen={setIsAddingCheckInsModalOpen}
      />
      <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
        <div className="flex items-center">
          <div className="h-11 w-11 flex-shrink-0">
            <img
              className="h-11 w-11 rounded-full"
              src={user.imageUrl || '/images/default-avatar.png'}
              alt=""
            />
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">
              {user.name}
              {user.isUserActivated ? (
                <span className="ml-1 inline-flex items-center rounded-md bg-green-50 px-1 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  ativado
                </span>
              ) : (
                <span className="ml-1 inline-flex items-center rounded-md bg-red-50 px-1 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                  não ativado
                </span>
              )}
            </div>
            <div className="mt-1 text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      {/* <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                      <div className="text-gray-900">{user.title}</div>
                      <div className="mt-1 text-gray-500">
                        {user.department}
                      </div>
                    </td> */}
      {/* <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Active
                      </span>
                    </td> */}
      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
        {user.checkInsQuantity}
      </td>
      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
        {formatPhoneNumberIntl(user.phoneNumber)}
      </td>
      <td className="whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
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
          <DropdownMenuContent className="w-[180px]">
            <DropdownMenuItem
              onClick={() => {
                setIsResetUserPasswordModalOpen(true);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              redefinir senha
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsAddingCheckInsModalOpen(true)}
              className="w-[180px]"
            >
              <CirclePlus className="mr-2 h-4 w-4" />
              adicionar check-ins
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsRemovingCheckInsModalOpen(true)}
              className="w-[180px] text-red-400 focus:bg-red-100 focus:text-red-500"
            >
              <CircleMinus className="mr-2 h-4 w-4" />
              remover check-ins
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
