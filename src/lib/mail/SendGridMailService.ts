/* eslint-disable @typescript-eslint/no-explicit-any */
import sendGridMail from '@sendgrid/mail';
import sendgridClient from '@sendgrid/client';
import {
  type MailTemplates,
  sendGridTemplatesMapper,
  TemplateParams,
} from '@lib/mail/mailTemplateMapper';
import {
  AddContactParams,
  AddToListParams,
  RetrieveContactByEmailParams,
  type MailService,
} from './interfaces/MailService';

export class SendGridMailService implements MailService {
  constructor() {
    sendGridMail.setApiKey(String(process.env.SENDGRID_API_KEY));
    sendgridClient.setApiKey(String(process.env.SENDGRID_API_KEY));
  }

  async send(message: {
    to: string;
    template: MailTemplates;
    templateData: TemplateParams[MailTemplates];
  }) {
    const { to, template, templateData } = message;
    const messageFormatted: sendGridMail.MailDataRequired = {
      to,
      from: 'suporte@yoka.club',
      templateId: sendGridTemplatesMapper[template],
      dynamicTemplateData: templateData,
    };

    try {
      await sendGridMail.send(messageFormatted);
      console.log('Email sent -', to);
    } catch (err) {
      console.error(err);
      console.log((err as any)?.response?.body?.errors);
    }
  }

  async addContact(params: AddContactParams): Promise<void> {
    const { email, firstName, lastName, listIds } = params;

    const data = {
      list_ids: listIds,
      contacts: [
        {
          email,
          first_name: firstName,
          last_name: lastName,
        },
      ],
    };

    const request = {
      url: `/v3/marketing/contacts`,
      method: 'PUT' as any,
      body: data,
    };

    try {
      await sendgridClient.request(request);
      console.log('Email added to contact -', email);
    } catch (err) {
      console.error(err);
      console.log((err as any)?.response?.body?.errors);
    }
  }

  async retrieveContactByEmail(params: RetrieveContactByEmailParams) {
    const { email } = params;

    const data = {
      emails: [email],
    };

    const request = {
      url: `/v3/marketing/contacts/search/emails`,
      method: 'POST' as any,
      body: data,
    };

    try {
      const clientResponse = await sendgridClient.request(request);
      const [response] = clientResponse;
      return response.body as any;
    } catch (err) {
      console.error(err);
      console.log((err as any)?.response?.body?.errors);
    }
  }

  async retrieveAllLists() {
    const queryParams = {
      page_size: 100,
    };

    const request = {
      url: `/v3/marketing/lists`,
      method: 'GET' as any,
      qs: queryParams,
    };

    try {
      const clientResponse = await sendgridClient.request(request);
      const [response] = clientResponse;
      return response.body as any;
    } catch (err) {
      console.error(err);
      console.log((err as any)?.response?.body?.errors);
    }
  }

  async addToList(params: AddToListParams) {
    const { recipientId, listId } = params;

    const request = {
      url: `/v3/contactdb/lists/${listId}/recipients/${recipientId}`,
      method: 'POST' as any,
    };

    try {
      await sendgridClient.request(request);
      console.log('Email added to list -', recipientId);
    } catch (err) {
      console.error(err);
      console.log((err as any)?.response?.body?.errors);
    }
  }
}
