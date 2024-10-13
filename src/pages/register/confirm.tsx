import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function ConfirmSignup() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!email) {
      const userEmail = localStorage.getItem('registrationEmail');
      localStorage.removeItem('registrationEmail');
      setEmail(userEmail || '');
    }
  }, [email]);

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          className="mx-auto h-12 w-auto"
          src="/images/yoka-club/yoka-horizontal-roxo.svg"
          alt="Logo Yoka Club"
          width={300}
          height={100}
        />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="flex items-center justify-center">
            <h2 className="ml-3 text-center text-xl font-bold tracking-tight text-gray-900">
              confira seu e-mail: {email}
            </h2>
          </div>
          <div>
            <p className="mt-2 text-center text-sm text-gray-600">
              você receberá um link para confirmar seu cadastro e ativar a sua
              conta :)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
