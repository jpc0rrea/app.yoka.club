import { NextApiResponse } from 'next';

import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';

interface EditEventRequest extends EnsureAuthenticatedRequest {
  body: {
    recordedUrl: string;
  };
  query: {
    id: string;
  };
}

const editEvent = async (req: EditEventRequest, res: NextApiResponse) => {
  const { recordedUrl } = req.body;

  try {
    if (!recordedUrl) {
      return res.status(400).json({
        message: 'Url inválida',
      });
    }
    if (recordedUrl) {
      const isValid = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name and extension
          '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
          '(\\:\\d+)?' + // port
          '(\\/[-a-z\\d%_.~+]*)*' + // path
          '(\\?[;&amp;a-z\\d%_.~+=-]*)?' + // query string
          '(\\#[-a-z\\d_]*)?$',
        'i'
      ) // fragment locator
        .test(recordedUrl);

      if (!isValid) {
        return res.status(400).json({
          message: 'Url inválida',
        });
      }
    }

    const event = await prisma.event.update({
      where: {
        id: req.query.id,
      },
      data: {
        recordedUrl,
      },
    });

    return res.status(201).json(event);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticatedWithRole(editEvent, ['ADMIN', 'INSTRUCTOR']);
