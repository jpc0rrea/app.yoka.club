import { SendGridMailService } from '@lib/mail/SendGridMailService';
import mailLists from '@lib/mail/mailLists';
import { NextApiRequest, NextApiResponse } from 'next';

interface TestRequest extends NextApiRequest {
  query: {
    email: string;
    name: string;
  };
}

export default async function (req: TestRequest, res: NextApiResponse) {
  const { email, name } = req.query;

  console.log(`-----------------------------------`);

  console.log({ email, name });
  const mailService = new SendGridMailService();

  await mailService.addContact({
    email: email,
    firstName: name,
    listIds: [mailLists['user-onboarding']],
  });

  const contactInSendGrid = await mailService.retrieveContactByEmail({
    email: email,
  });

  console.log('contactInSendGrid', contactInSendGrid);

  // console.log('contact', {
  //   recipientId: contactInSendGrid.result[email].contact.id,
  //   listId: mailLists['user-onboarding'],
  // });

  const allListsResponse = await mailService.retrieveAllLists();

  console.log('allListsResponse', allListsResponse);

  // await mailService.addToList({
  //   recipientId: contactInSendGrid.result[email].contact.id,
  //   listId: mailLists['user-onboarding'],
  // });

  return res.status(200).json({
    message: 'User added to list',
  });
}
