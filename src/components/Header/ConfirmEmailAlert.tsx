import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { api } from '@lib/api';
import { successToast } from '@components/Toast/SuccessToast';
import { errorToast } from '@components/Toast/ErrorToast';
import { Loader2 } from 'lucide-react';
import { Button } from '@components/ui/button';

export default function ConfirmEmailAlert() {
  const [isSending, setIsSending] = useState(false);
  const [hasSent, setHasSent] = useState(false);

  const hasEmailVerified = true;

  const handleSendConfirmationEmail = async () => {
    setIsSending(true);

    const response = await api.post('/users/send-confirmation-email');

    if (response.status === 200) {
      setIsSending(false);
      successToast({
        message: 'enviamos um e-mail de confirmação',
        description: 'verifique sua caixa de entrada',
      });

      setHasSent(true);
    } else {
      setIsSending(false);
      errorToast({
        message: 'não foi possível enviar o e-mail de confirmação',
        description: 'tente novamente mais tarde',
      });
    }
  };

  if (hasEmailVerified) {
    return null;
  }

  return (
    <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {isSending ? (
              <div className="flex w-full justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </div>
            ) : hasSent ? (
              <>email de confirmação enviado.</>
            ) : (
              <>
                email não confirmado.{' '}
                <Button
                  variant={`secondary`}
                  onClick={handleSendConfirmationEmail}
                  className="font-medium text-yellow-700 underline hover:text-yellow-600"
                >
                  enviar confirmação
                </Button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
