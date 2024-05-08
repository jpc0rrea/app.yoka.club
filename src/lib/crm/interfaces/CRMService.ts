export interface AddContactParams {
  name: string;
  phone: string;
  email: string;
  origin: 'app' | 'ad';
}

export interface CRMService {
  addContact: (params: AddContactParams) => Promise<void>;
}
