import { NewUsers } from '@hooks/useBusinessInformations';
import { NewUsersDataTable } from './data-table';
import { columns } from './columns';
import { Loader2 } from 'lucide-react';

interface NewUsersTableProps {
  newUsersTableData: NewUsers[] | undefined;
}

export default function NewUsersTable({
  newUsersTableData,
}: NewUsersTableProps) {
  return (
    <div className="py-2">
      {newUsersTableData ? (
        <NewUsersDataTable columns={columns} data={newUsersTableData} />
      ) : (
        <div>
          <Loader2 className="animate-spin" />
        </div>
      )}
    </div>
  );
}
