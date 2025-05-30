import { NextApiResponse } from 'next';

import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';

interface DeleteEventRequest extends EnsureAuthenticatedRequest {
  query: {
    id: string;
  };
}

const editEvent = async (req: DeleteEventRequest, res: NextApiResponse) => {
  try {
    // Remove event from all trails first
    await prisma.trailEvent.deleteMany({
      where: { eventId: req.query.id },
    });

    // Delete the event
    await prisma.event.delete({
      where: {
        id: req.query.id,
      },
    });

    return res.status(201).json({
      message: 'evento deletado com sucesso',
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticatedWithRole(editEvent, ['ADMIN', 'INSTRUCTOR']);
