/* eslint-disable @typescript-eslint/no-explicit-any */
import sendGridMail from '@sendgrid/mail';
import {
  type MailTemplates,
  sendGridTemplatesMapper,
  TemplateParams,
} from '@lib/mail/mailTemplateMapper';
import { type MailService } from './interfaces/MailService';

export class SendGridMailService implements MailService {
  constructor() {
    sendGridMail.setApiKey(String(process.env.SENDGRID_API_KEY));
  }

  async send(message: {
    to: string;
    template: MailTemplates;
    templateData: TemplateParams[MailTemplates];
  }) {
    const { to, template, templateData } = message;
    const messageFormatted: sendGridMail.MailDataRequired = {
      to,
      from: 'kaka@yogacomkaka.com',
      templateId: sendGridTemplatesMapper[template],
      dynamicTemplateData: templateData,
    };

    try {
      await sendGridMail.send(messageFormatted);
      console.log('Email sent -', to);
    } catch (err) {
      console.error(err);
    }
  }
}
