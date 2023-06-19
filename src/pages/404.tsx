import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-full bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="mx-auto max-w-max">
        <main className="sm:flex">
          <p className="text-4xl font-bold tracking-tight text-brand-purple-600 sm:text-5xl">
            404
          </p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                página não encontrada
              </h1>
              <p className="mt-1 text-base text-gray-500">
                de uma olhadinha na url na barra de endereço e tenta de novo
              </p>
            </div>
            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <Link href="/">
                <span className="inline-flex items-center rounded-md border border-transparent bg-brand-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-700 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:ring-offset-2">
                  voltar para a home
                </span>
              </Link>
              <Link
                href="https://api.whatsapp.com/send/?phone=5522999542672&text&type=phone_number&app_absent=0"
                target="_blank"
              >
                <span className="inline-flex items-center rounded-md border border-transparent bg-brand-purple-100 px-4 py-2 text-sm font-medium text-brand-purple-700 hover:bg-brand-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:ring-offset-2">
                  entre em contato comigo
                </span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
