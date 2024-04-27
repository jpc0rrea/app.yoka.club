import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import controller from '@models/controller';
import authentication from '@models/authentication';
import cacheControl from '@models/cache-control';
import event from '@models/events';
import { AuthenticatedRequest } from '@models/controller/types';

interface UpdateAttendanceRequest extends AuthenticatedRequest {
  body: {
    eventId: string;
    attendance: {
      id: string;
      attended: boolean;
    }[];
  };
}

const router = createRouter<AuthenticatedRequest, NextApiResponse>();

router
  .use(controller.injectRequestMetadata)
  .use(authentication.injectAuthenticatedUserOnRequest)
  .use(controller.logRequest)
  .use(cacheControl.noCache)
  .put(updateAttendanceHandler);

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function updateAttendanceHandler(
  req: UpdateAttendanceRequest,
  res: NextApiResponse
) {
  const { eventId, attendance } = req.body;

  console.log(req.context);

  await event.updateEventAttendance({
    eventId,
    attendance,
    userId: req.context.user.id,
  });

  return res.status(200).json({
    code: 'attendance-updated',
  });
}
