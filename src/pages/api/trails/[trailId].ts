import { NextApiResponse } from 'next';
import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';
import { trailSelect } from '@models/trails/types';

interface TrailGetRequest extends EnsureAuthenticatedRequest {
  query: {
    trailId: string;
  };
}

const trailHandler = async (req: TrailGetRequest, res: NextApiResponse) => {
  try {
    const { trailId } = req.query;

    if (req.method === 'GET') {
      // Get single trail - public endpoint for authenticated users
      const trail = await prisma.trail.findUnique({
        where: { id: trailId },
        select: trailSelect,
      });

      if (!trail) {
        return res.status(404).json({
          message: 'trilha não encontrada',
        });
      }

      return res.status(200).json({ trail });
    }

    return res.status(405).json({ message: 'método não permitido' });
  } catch (err) {
    console.error('Error in public trail handler:', err);
    return res.status(500).json({
      message: 'erro interno do servidor',
    });
  }
};

export default ensureAuthenticated(trailHandler);
