import { type NextPage } from 'next';
import { z } from 'zod';
import { UploadButton } from '@lib/uploadthing';
// You need to import our styles for the button to look right. Best to import in the root /_app.tsx but this is fine
import '@uploadthing/react/styles.css';

import Header from '@components/Header';
import Sidebar from '@components/Sidebar';
import { withSSREnsureSubscribed } from '@server/middlewares/withSSREnsureSubscribed';
import { Input } from '@components/Form/Input';
import useUser from '@hooks/useUser';
import { TextArea } from '@components/Form/TextArea';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { errorToast } from '@components/Toast/ErrorToast';
import { api } from '@lib/api';
import { successToast } from '@components/Toast/SuccessToast';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import ChangePassword from '@components/ChangePassword';
import { Button } from '@components/ui/button';
import { BottomNavBar } from '@components/bottom-nav-bar';

const updateProfileFormSchema = z.object({
  displayName: z.string({
    required_error: 'nome é obrigatório',
  }),
  username: z
    .string({
      required_error: 'username é obrigatório',
    })
    .min(3, {
      message: 'username deve ter no mínimo 3 caracteres',
    })
    .refine((value) => /^[a-zA-Z0-9_.-]+$/.test(value), {
      message: 'username deve ser alfanumérico',
    }),
  bio: z.string().nullable(),
  name: z
    .string({
      required_error: 'nome completo é obrigatório',
    })
    .min(6, {
      message: 'nome completo deve ter no mínimo 6 caracteres',
    }),
  email: z
    .string({
      required_error: 'e-mail é obrigatório',
    })
    .email('e-mail inválido'),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileFormSchema>;

const Profile: NextPage = () => {
  const { user, fetchUser } = useUser();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileFormSchema),
    defaultValues: {
      displayName: user?.displayName,
      username: user?.username,
      bio: user?.bio,
      name: user?.name,
      email: user?.email,
    },
  });

  const usernameValue = useWatch({ control, name: 'username' });

  useEffect(() => {
    if (user) {
      setValue('displayName', user.displayName);
      setValue('username', user.username);
      setValue('bio', user.bio);
      setValue('name', user.name);
      setValue('email', user.email);
    }
  }, [user, setValue]);

  const handleUpdateProfile = async (data: UpdateProfileFormData) => {
    try {
      console.log(data);
      await api.put('/user/profile', {
        displayName: data.displayName,
        username: data.username,
        bio: data.bio,
        name: data.name,
        email: data.email,
      });

      await fetchUser();

      successToast({
        message: 'perfil atualizado com sucesso',
        description: 'suas informações foram atualizadas :)',
      });
    } catch (err) {
      const { message, description } = convertErrorMessage({
        err,
      });

      errorToast({
        message,
        description,
      });
    }
  };

  const handleCancelUpdateProfile = useCallback(() => {
    if (user) {
      setValue('displayName', user.displayName);
      setValue('username', user.username);
      setValue('bio', user.bio);
      setValue('name', user.name);
      setValue('email', user.email);
    }
  }, [user, setValue]);

  return (
    <>
      <div>
        <Sidebar />
        <div className="flex flex-1 flex-col md:pl-64">
          <BottomNavBar />

          <main className="flex-1 bg-white pb-20 md:pb-0">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                <Tabs defaultValue="account" className="">
                  <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="account">conta</TabsTrigger>
                    <TabsTrigger value="password">senha</TabsTrigger>
                  </TabsList>

                  <TabsContent value="account">
                    <form
                      className="space-y-8 divide-y divide-gray-200"
                      onSubmit={handleSubmit(handleUpdateProfile)}
                    >
                      <div className="max-w-2xl space-y-8 divide-y divide-gray-200">
                        <div>
                          <div>
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                              perfil
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              essas informações vão estar disponíveis para
                              outras yoginis :)
                            </p>
                          </div>

                          <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                              <Input
                                label="nome"
                                helperText="esse é o nome que ficará disponível para os outros usuários"
                                {...register('displayName')}
                              />
                            </div>

                            <div className="sm:col-span-4">
                              <Input
                                label="username"
                                helperText={`esse é o nome que ficará na url para acessar seu perfil: yogacomkaka.com/@${usernameValue}`}
                                errorMessage={errors.username?.message}
                                {...register('username')}
                              />
                            </div>

                            <div className="sm:col-span-6">
                              <TextArea
                                label="bio"
                                helperText="fale um pouquinho sobre você"
                                {...register('bio')}
                              />
                            </div>

                            {/* <div className="sm:col-span-4">
                          <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700"
                          >
                            nome de usuário
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                              yogacomkaka.com/
                            </span>
                            <input
                              type="text"
                              name="username"
                              id="username"
                              autoComplete="username"
                              className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label
                            htmlFor="about"
                            className="block text-sm font-medium text-gray-700"
                          >
                            sobre
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="about"
                              name="about"
                              rows={3}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              defaultValue={''}
                            />
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            fale um pouquinho sobre você
                          </p>
                        </div> */}

                            <div className="sm:col-span-6">
                              <label
                                htmlFor="photo"
                                className="ml-2 block text-sm font-medium text-gray-700"
                              >
                                foto
                              </label>
                              <div className="mt-1 flex items-center">
                                <img
                                  className="h-20 w-20 rounded-full"
                                  src={
                                    user?.imageUrl ||
                                    '/images/default-avatar.png'
                                  }
                                  alt=""
                                />
                                {/* <Button
                                variant="secondary"
                              type="button"
                              className="ml-5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              atualizar
                            </Button> */}
                                <UploadButton
                                  className="ml-2 ut-button:h-8 ut-button:bg-brand-yoka-purple-700 ut-button:text-sm ut-button:after:bg-brand-yoka-purple-800 ut-button:ut-readying:bg-brand-yoka-purple-700/50 ut-uploading:cursor-not-allowed"
                                  endpoint="imageUploader"
                                  onClientUploadComplete={async (res) => {
                                    // Do something with the response
                                    console.log('Files: ', res);

                                    await fetchUser();
                                    successToast({
                                      message: 'foto atualizada com sucesso',
                                      description:
                                        'sua foto de perfil foi atualizada :)',
                                    });
                                  }}
                                  onUploadError={(error: Error) => {
                                    // Do something with the error.
                                    console.log(error);
                                    errorToast({
                                      message: 'erro ao atualizar foto',
                                      description:
                                        'ocorreu um erro ao atualizar sua foto de perfil :(',
                                    });
                                  }}
                                  content={{
                                    button({
                                      ready,
                                      uploadProgress,
                                      isUploading,
                                    }) {
                                      if (isUploading)
                                        return (
                                          <div>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          </div>
                                        );
                                      if (ready) return <div>atualizar</div>;

                                      return `${uploadProgress}%`;
                                    },
                                    allowedContent({
                                      ready,
                                      isUploading,
                                      uploadProgress,
                                    }) {
                                      if (!ready)
                                        return 'Checking what you allow';
                                      if (isUploading)
                                        return `${uploadProgress}%`;
                                      return `escolha a sua foto nova :)`;
                                    },
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-8">
                          <div>
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                              informações pessoais
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              essas informações são privadas :)
                            </p>
                          </div>
                          <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                              <Input
                                label="nome completo"
                                {...register('name')}
                              />
                            </div>

                            <div className="sm:col-span-4">
                              <Input label="e-mail" {...register('email')} />
                            </div>
                          </div>
                        </div>

                        {/* <div className="pt-8">
                      <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                          notificações
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          nós só vamos te comunicar coisas importantes, mas
                          escolha só as que você quiser receber :)
                        </p>
                      </div>
                      <div className="mt-6">
                        <fieldset>
                          <legend className="sr-only">By Email</legend>
                          <div
                            className="text-base font-medium text-gray-900"
                            aria-hidden="true"
                          >
                            por e-mail
                          </div>
                          <div className="mt-4 space-y-4">
                            <div className="relative flex items-start">
                              <div className="flex h-5 items-center">
                                <input
                                  id="comments"
                                  name="comments"
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label
                                  htmlFor="comments"
                                  className="font-medium text-gray-700"
                                >
                                  aulas ao vivo
                                </label>
                                <p className="text-gray-500">
                                  seja notificado quando uma nova aula ao vivo
                                  for postada.
                                </p>
                              </div>
                            </div>
                          </div>
                        </fieldset>
                      </div>
                    </div>

                    <div className="pt-8">
                      <div className="sm:flex sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                            conecte sua agenda
                          </h3>
                          <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>
                              conecte sua conta com o google agenda para
                              podermos adicionar eventos sobre as suas aulas ao
                              vivo
                            </p>
                          </div>
                        </div>
                        <div className="mt-5 sm:ml-6 sm:mt-0 sm:flex sm:flex-shrink-0 sm:items-center">
                          {hasConnectedAgenda ? (
                            <div className="inline-flex cursor-not-allowed items-center rounded-md border border-transparent bg-gray-400 px-4 py-2 font-medium text-white shadow-sm sm:text-sm">
                              conectado
                              <CheckIcon className="ml-2 h-4 w-4" />
                            </div>
                          ) : (
                            <Button
                            variant="secondary"
                              type="button"
                              onClick={() => {
                                console.log('conectar agenda');
                              }}
                              className="inline-flex items-center rounded-md border border-transparent bg-purple-800 px-4 py-2 font-medium text-white shadow-sm hover:bg-purple-900"
                            >
                              conectar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div> */}
                      </div>

                      <div className="pt-5">
                        <div className="flex justify-end">
                          <Button
                            variant="secondary"
                            type="button"
                            onClick={handleCancelUpdateProfile}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 "
                          >
                            cancelar
                          </Button>
                          <Button
                            type="submit"
                            className="ml-3 inline-flex w-16 justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm"
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'salvar'
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </TabsContent>
                  <TabsContent value="password">
                    <ChangePassword />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = withSSREnsureSubscribed(async () => {
  return {
    props: {},
  };
});

export default Profile;
