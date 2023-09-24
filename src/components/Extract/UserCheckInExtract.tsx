import { useStatement } from '@hooks/useStatement';
import useUser from '@hooks/useUser';
import { format, isAfter } from 'date-fns';

export default function UserCheckInExtract() {
  const { data: statement } = useStatement();
  const { user } = useUser();

  const checkInsQuantity = user?.checkInsQuantity || 0;

  let balance = checkInsQuantity;

  const statementToRender = statement
    ?.sort((a, b) => {
      // sort by date
      if (isAfter(new Date(a.createdAt), new Date(b.createdAt))) {
        return -1;
      } else {
        return 1;
      }
    })
    .map((statementItem) => {
      const thisBalance = balance;
      balance =
        statementItem.type === 'CREDIT'
          ? balance - statementItem.checkInsQuantity
          : balance + statementItem.checkInsQuantity;
      return {
        ...statementItem,
        balance: thisBalance,
      };
    });

  return (
    <div>
      <div className="mt-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          check-ins
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          histórico de todos os seus check-ins na plataforma
        </p>
      </div>

      <section aria-labelledby="billing-history-heading" className="mt-6">
        <div className="bg-white shadow sm:overflow-hidden sm:rounded-md">
          {/* <div className="px-4 sm:px-6">
            <h2
              id="billing-history-heading"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Billing history
            </h2>
          </div> */}
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden border-t border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                        >
                          data
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                        >
                          tipo
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                        >
                          descrição
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                        >
                          quantidade
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                        >
                          saldo
                        </th>
                        {/*
                                  `relative` is added here due to a weird bug in Safari that causes `sr-only` headings to introduce overflow on the body on mobile.
                                */}
                        {/* <th
                          scope="col"
                          className="relative px-6 py-3 text-left text-sm font-medium text-gray-500"
                        >
                          <span className="sr-only">View receipt</span>
                        </th> */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {statementToRender?.map((statementItem) => (
                        <tr key={statementItem.id}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            <time
                              dateTime={new Date(
                                statementItem.createdAt
                              ).toISOString()}
                            >
                              {format(
                                new Date(statementItem.createdAt),
                                'dd/MM/yyyy'
                              )}
                            </time>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {statementItem.type === 'CREDIT' ? (
                              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                crédito
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                débito
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {statementItem.description}
                          </td>
                          <td
                            className={`whitespace-nowrap px-6 py-4 text-sm ${
                              statementItem.type === 'CREDIT'
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}
                          >
                            {statementItem.type === 'CREDIT' ? '+' : '-'}
                            {statementItem.checkInsQuantity}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {statementItem.balance}
                          </td>
                          {/* <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                            <a
                              href={payment.href}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              View receipt
                            </a>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
