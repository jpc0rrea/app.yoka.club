import { NextApiResponse } from 'next';

import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';

interface UpdateWatchSessionProgressRequest extends EnsureAuthenticatedRequest {
  body: {
    watchSessionId: string | undefined;
    progress: number;
    playedSeconds: number;
  };
}

const listNextEvents = async (
  req: UpdateWatchSessionProgressRequest,
  res: NextApiResponse
) => {
  try {
    const { watchSessionId, progress, playedSeconds } = req.body;

    if (!watchSessionId) {
      return res.status(400).json({
        message: 'watchSessionId is required',
      });
    }

    if ((!progress && progress !== 0) || progress < 0 || progress > 1) {
      return res.status(400).json({
        message: 'progress must be between 0 and 1',
      });
    }

    if ((!playedSeconds && playedSeconds !== 0) || playedSeconds < 0) {
      return res.status(400).json({
        message: 'playedSeconds must be greater than 0',
      });
    }

    await prisma.watchSession.update({
      where: {
        id: watchSessionId,
      },
      data: {
        progress,
        playedSeconds,
      },
    });

    return res.status(200).json({
      message: 'ok',
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export default ensureAuthenticated(listNextEvents);
