/* eslint-disable @typescript-eslint/no-explicit-any */
import { MailTemplates, TemplateParams } from '../mailTemplateMapper';

interface SendMailParams<T extends MailTemplates> {
  to: string;
  template: MailTemplates;
  templateData: TemplateParams[T];
}

export interface AddContactParams {
  email: string;
  firstName?: string;
  lastName?: string;
  listIds?: string[];
}

export interface ContactResponse {
  result: Result;
}

export interface Result {
  [email: string]: {
    contact: Contact;
  };
}

export interface Contact {
  address_line_1: string;
  address_line_2: string;
  alternate_emails: string[];
  city: string;
  country: string;
  email: string;
  first_name: string;
  id: string;
  last_name: string;
  list_ids: any[];
  segment_ids: any[];
  postal_code: string;
  state_province_region: string;
  phone_number: string;
  whatsapp: string;
  line: string;
  facebook: string;
  unique_name: string;
  custom_fields: object;
  created_at: string;
  updated_at: string;
  _metadata: Metadata;
}

export interface Metadata {
  self: string;
}

export interface RetrieveContactByEmailParams {
  email: string;
}

export interface AddToListParams {
  recipientId: string;
  listId: string;
}

export interface MailService {
  send<T extends MailTemplates>(message: SendMailParams<T>): Promise<void>;
  addContact(params: AddContactParams): Promise<void>;
  retrieveContactByEmail(
    params: RetrieveContactByEmailParams
  ): Promise<ContactResponse>;
  addToList(params: AddToListParams): Promise<void>;
}
