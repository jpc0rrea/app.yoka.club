import { useAutoAnimate } from '@formkit/auto-animate/react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';
import useUser from '@hooks/useUser';
import { api } from '@lib/api';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { LegacyRef, useEffect, useState } from 'react';
import { Button } from '@components/ui/button';

export default function VerifyEmail() {
  // get the token from the query
  const router = useRouter();
  const { user, fetchUser } = useUser();

  const [message, setMessage] = useState('verificando o seu e-mail...');
  const [description, setDescription] = useState(
    'aguarde um pouquinho, não leva mais do que 10 segundos'
  );
  const [hasVerifiedEmail, setHasVerifiedEmail] = useState(false);
  const [state, setState] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [buttonText, setButtonText] = useState('página inicial');

  const [titleAndButtonRef] = useAutoAnimate();
  const [descriptionRef] = useAutoAnimate();

  useEffect(() => {
    console.log(router.query.token, user);
    if (router.query.token && user) {
      api
        .put('/users/verify-email', { token: router.query.token })
        .then(() => {
          setState('success');
          setMessage('e-mail verificado com sucesso!');

          setDescription(
            'você já pode fechar essa aba, ou ir para a página inicial'
          );
          setButtonText('página inicial');
          setHasVerifiedEmail(true);

          // session.update({
          //   ...session.data,
          //   user: {
          //     ...session.data.user,
          //     emailVerified: true,
          //   },
          // });
        })
        .catch((err) => {
          console.log(err);
          setState('error');
          setMessage('erro ao verificar o e-mail');
          if (user) {
            setDescription(
              'você já pode fechar essa aba, ou ir para a página inicial'
            );
            setButtonText('página inicial');
          } else {
            setDescription('faça login na plataforma e tente novamente');
            setButtonText('fazer login');
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
          <div
            className="flex items-center justify-center"
            ref={titleAndButtonRef as LegacyRef<HTMLDivElement>}
          >
            {state === 'loading' ? (
              <Loader2 className="mr-2 mt-4 h-4 w-4 animate-spin" />
            ) : state === 'success' ? (
              <CheckCircleIcon className="mt-1 h-5 w-5 text-green-400" />
            ) : (
              <XCircleIcon className="mt-1 h-5 w-5 text-red-400" />
            )}
            <h2 className="ml-3 text-center text-3xl font-bold tracking-tight text-gray-900">
              {message}
            </h2>
          </div>
          <div ref={descriptionRef as LegacyRef<HTMLDivElement>}>
            <p className="mt-2 text-center text-sm text-gray-600">
              {description}
            </p>
          </div>
          <div className="mt-6">
            <Button
              variant="secondary"
              type="button"
              className="flex w-full justify-center rounded-md border border-transparent bg-brand-purple-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-700 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:ring-offset-2"
              onClick={async () => {
                if (user) {
                  if (hasVerifiedEmail) {
                    await fetchUser();
                  }
                  router.push('/');
                } else {
                  router.push('/login');
                }
              }}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
