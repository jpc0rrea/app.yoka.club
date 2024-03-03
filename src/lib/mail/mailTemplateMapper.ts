export const sendGridTemplatesMapper = {
  // emailConfirmation: 'd-78a52280d4344f56bb8e9b4e3b0ce27d',
  forgotPassword: 'd-b746c6a5c0474b4692012f5b31f67917',
  activateAccount: 'd-2c45edf990d64225ba2e90581a486014',
  welcomeEmail: 'd-8478a87026b54101867e96e6b36dc520',
  userSubscribedToPlanWithCheckIns: 'd-135b7a420b234edc8a04fa2e92ad700d',
  userSubscribedToPlanWithoutCheckIns: 'd-fab48ab89e30401d8ac08b976208d379',
  userPurchasedCheckIns: 'd-d7e06fd987de4e659133a04aaab65877',
};

export type MailTemplates = keyof typeof sendGridTemplatesMapper;

interface EmailConfirmationParams {
  buttonLink: string;
}

interface ActivateAccountParams {
  buttonLink: string;
  userName: string;
}

interface ResetPasswordParams {
  buttonLink: string;
}

interface WelcomeEmailParams {
  buttonLink: string;
  userName: string;
}

interface UserSubscribedToPlanParams {
  userName: string;
  planName: string;
}

interface UserSubscribedToPlanWithoutCheckInsParams {
  userName: string;
}

interface UserPurchasedCheckInsParams {
  userName: string;
  checkInsQuantity: number;
}

export type TemplateParams = {
  emailConfirmation: EmailConfirmationParams;
  forgotPassword: ResetPasswordParams;
  activateAccount: ActivateAccountParams;
  welcomeEmail: WelcomeEmailParams;
  userSubscribedToPlanWithCheckIns: UserSubscribedToPlanParams;
  userSubscribedToPlanWithoutCheckIns: UserSubscribedToPlanWithoutCheckInsParams;
  userPurchasedCheckIns: UserPurchasedCheckInsParams;
};
