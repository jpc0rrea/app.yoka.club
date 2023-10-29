export const sendGridTemplatesMapper = {
  emailConfirmation: 'd-78a52280d4344f56bb8e9b4e3b0ce27d',
  forgotPassword: 'd-b746c6a5c0474b4692012f5b31f67917',
  activateAccount: 'd-2c45edf990d64225ba2e90581a486014',
  welcomeEmail: 'd-8478a87026b54101867e96e6b36dc520',
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

export type TemplateParams = {
  emailConfirmation: EmailConfirmationParams;
  forgotPassword: ResetPasswordParams;
  activateAccount: ActivateAccountParams;
  welcomeEmail: WelcomeEmailParams;
};
