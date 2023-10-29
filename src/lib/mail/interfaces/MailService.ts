import { MailTemplates, TemplateParams } from '../mailTemplateMapper';

interface SendMailParams<T extends MailTemplates> {
  to: string;
  template: MailTemplates;
  templateData: TemplateParams[T];
}

export interface MailService {
  send<T extends MailTemplates>(message: SendMailParams<T>): Promise<void>;
}
