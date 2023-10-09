import { usePayments } from '@hooks/usePayments';
import { convertNumberToReal } from '@lib/utils';
import { format } from 'date-fns';

export default function UserPayments() {
  const { data: payments } = usePayments();

  return (
    <div>
      <div className="mt-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          pagamentos
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          histórico de todos os seus pagamentos feitos para a plataforma
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
                          descrição
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                        >
                          valor
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
                      {payments?.map((payment) => (
                        <tr key={payment.id}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            <time
                              dateTime={new Date(
                                payment.createdAt
                              ).toISOString()}
                            >
                              {format(
                                new Date(payment.createdAt),
                                "dd/MM/yyyy 'às' HH:mm"
                              )}
                            </time>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            pagamento{' '}
                            {payment.plan
                              ? `da assinatura ${
                                  payment.plan.recurrencePeriod === 'MONTHLY'
                                    ? 'mensal'
                                    : 'trimestral'
                                }`
                              : 'avulso'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {convertNumberToReal(payment.grossValue)}
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
