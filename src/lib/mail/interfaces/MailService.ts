import { MailTemplates } from '../mailTemplateMapper';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface MailService {
  send(message: {
    to: string;
    template: MailTemplates;
    templateData: any;
  }): Promise<void>;
}
