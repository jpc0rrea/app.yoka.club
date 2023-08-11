import { isAfter } from 'date-fns';

const checkInExtract = [
  {
    id: 1,
    type: 'credit',
    quantity: 1,
    date: '15/06/2023',
    datetime: '2023-06-15',
    description: 'check-in inicial - bem vindo a plataforma :)',
    balance: 1,
  },
  {
    id: 2,
    type: 'debit',
    quantity: 1,
    date: '16/06/2023',
    datetime: '2023-06-16',
    description: 'check-in realizado - aula online com kaká',
    balance: 0,
  },
  {
    id: 3,
    type: 'credit',
    quantity: 8,
    date: '17/06/2023',
    datetime: '2023-06-17',
    description: 'assinatura mensal - plataforma',
    balance: 8,
  },
  {
    id: 4,
    type: 'debit',
    quantity: 1,
    date: '18/06/2023',
    datetime: '2023-06-18',
    description: 'check-in realizado - aula online com kaká',
    balance: 7,
  },
];

export default function UserCheckInExtract() {
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
                      {checkInExtract
                        .sort((a, b) => {
                          // sort by date
                          if (
                            isAfter(new Date(a.datetime), new Date(b.datetime))
                          ) {
                            return -1;
                          } else {
                            return 1;
                          }
                        })
                        .map((extractItem) => (
                          <tr key={extractItem.id}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                              <time dateTime={extractItem.datetime}>
                                {extractItem.date}
                              </time>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {extractItem.type === 'credit' ? (
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
                              {extractItem.description}
                            </td>
                            <td
                              className={`whitespace-nowrap px-6 py-4 text-sm ${
                                extractItem.type === 'credit'
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }`}
                            >
                              {extractItem.type === 'credit' ? '+' : '-'}
                              {extractItem.quantity}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {extractItem.balance}
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
