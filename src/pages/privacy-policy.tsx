// privacy policy:
// Política de Privacidade

import Image from 'next/image';

export default function PrivacyPolicy() {
  return (
    <div className="flex min-h-full flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          className="mx-auto h-12 w-auto"
          src="/images/yoka-club/yoka-horizontal-roxo.svg"
          alt="logo yoka club"
          width={300}
          height={100}
        />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <h1 className="mb-4 text-center text-2xl font-bold">
            Política de Privacidade
          </h1>

          <h2 className="mb-2 text-left text-xl font-bold">
            1. Coleta de Informações Pessoais:
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            1.1. Coletamos informações pessoais, como nome, endereço de e-mail,
            número de telefone, e informações de pagamento, quando você se
            cadastra em nossa plataforma.{' '}
          </p>

          <h2 className="mb-2 mt-4 text-left text-xl font-bold">
            2. Uso de Informações Pessoais:
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            2.1. Utilizamos suas informações pessoais para: <br />- Fornecer
            acesso às aulas de yoga e aos recursos da plataforma. <br />
            - Processar pagamentos e gerenciar sua assinatura. <br />
            - Enviar atualizações sobre nossos serviços e promoções. <br />
            2.2. Não compartilhamos suas informações pessoais com terceiros sem
            seu consentimento, exceto quando exigido por lei.
          </p>

          <h2 className="mb-2 mt-4 text-left text-xl font-bold">
            3. Segurança das Informações:
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            3.1. Tomamos medidas para proteger suas informações pessoais e dados
            de pagamento, incluindo criptografia e segurança física dos
            servidores.
          </p>

          <h2 className="mb-2 mt-4 text-left text-xl font-bold">
            4. Cookies e Rastreamento:
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            4.1. Usamos cookies e tecnologias semelhantes para melhorar sua
            experiência na plataforma.
          </p>

          <h2 className="mb-2 mt-4 text-left text-xl font-bold">
            5. Cancelamento de Assinatura:
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            5.1. Você pode cancelar sua assinatura a qualquer momento, seguindo
            as instruções em nossa plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}
