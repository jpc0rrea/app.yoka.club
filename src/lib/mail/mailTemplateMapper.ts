export const sendGridTemplatesMapper = {
  emailConfirmation: 'd-78a52280d4344f56bb8e9b4e3b0ce27d',
  forgotPassword: 'd-b746c6a5c0474b4692012f5b31f67917',
  activateAccount: 'd-2c45edf990d64225ba2e90581a486014',
};

export type MailTemplates = keyof typeof sendGridTemplatesMapper;
