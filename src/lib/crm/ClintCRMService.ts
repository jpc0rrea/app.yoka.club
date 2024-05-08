import { clintApi } from '@lib/api';
import { AddContactParams, CRMService } from './interfaces/CRMService';
import { parsePhoneNumber } from 'react-phone-number-input';
import { clintCRMOriginMapper } from './originMapper';
import sendMessageToYogaComKakaTelegramGroup from '@lib/telegram';

export class ClintCRMService implements CRMService {
  async addContact(params: AddContactParams): Promise<void> {
    const { name, phone, email } = params;

    const phoneNumber = parsePhoneNumber(phone);

    if (!phoneNumber) {
      throw new Error('Invalid phone number');
    }

    const ddi = `+${phoneNumber.countryCallingCode}`;

    const nationalNumber = phoneNumber.nationalNumber;

    try {
      // cria o contato no CRM
      const response = await clintApi.post<{
        status: number;
        data: {
          id: string;
        };
      }>('/contacts', {
        name,
        email,
        ddi,
        phone: nationalNumber,
      });

      console.log(response.data);

      // cria o negócio no CRM na origin certa
      await clintApi.post('/deals', {
        contact_id: response.data.data.id,
        origin_id: clintCRMOriginMapper[params.origin],
        stage: 'BASE',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);

      const error =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'ver erro na vercel';

      await sendMessageToYogaComKakaTelegramGroup(
        `
        🚨🚨
    erro ao cadastrar o usuário ${name} no clint.
    
        email: ${email}
        telefone: ${phone}

        erro: ${error}
    `
      );
      // throw new Error('Error adding contact to CRM');
    }
  }
}
