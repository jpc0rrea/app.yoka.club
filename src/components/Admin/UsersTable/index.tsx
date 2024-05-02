import { useUsers } from '@hooks/useUsers';

import UserRow from './UserRow';
import { Loader2 } from 'lucide-react';

export default function UsersTable() {
  const { data: users } = useUsers();

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                >
                  nome
                </th>
                <th
                  scope="col"
                  className="min-w-max px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  check-ins restantes
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  celular
                </th>
                {/* <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Role
                </th> */}
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                  <span className="sr-only">editar</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {!users ? (
                <Loader2 className="mr-2 mt-4 h-4 w-4 animate-spin" />
              ) : (
                users.map((user) => <UserRow user={user} key={user.id} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
