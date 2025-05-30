import { NextApiResponse } from 'next';
import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';
import { prisma } from '@server/db';
import { trailSelect } from '@models/trails/types';

interface TrailGetRequest extends EnsureAuthenticatedRequest {
  query: {
    trailId: string;
  };
}

interface TrailUpdateRequest extends EnsureAuthenticatedRequest {
  query: {
    trailId: string;
  };
  body: {
    title: string;
    description?: string;
    coverImageUrl: string;
    eventIds: string[];
  };
}

interface TrailDeleteRequest extends EnsureAuthenticatedRequest {
  query: {
    trailId: string;
  };
}

const trailHandler = async (
  req: TrailGetRequest | TrailUpdateRequest | TrailDeleteRequest,
  res: NextApiResponse
) => {
  try {
    const { trailId } = req.query;

    if (req.method === 'GET') {
      // Get single trail
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

    if (req.method === 'PUT') {
      // Update trail
      const { title, description, coverImageUrl, eventIds = [] } = req.body!;

      if (!title || !coverImageUrl) {
        return res.status(400).json({
          message: 'título e imagem de capa são obrigatórios',
        });
      }

      // Check if trail exists
      const existingTrail = await prisma.trail.findUnique({
        where: { id: trailId },
      });

      if (!existingTrail) {
        return res.status(404).json({
          message: 'trilha não encontrada',
        });
      }

      // Verify all events exist if eventIds provided
      if (eventIds.length > 0) {
        const events = await prisma.event.findMany({
          where: { id: { in: eventIds } },
          select: { id: true },
        });

        if (events.length !== eventIds.length) {
          return res.status(400).json({
            message: 'um ou mais eventos não foram encontrados',
          });
        }
      }

      // Update trail with transaction to handle trail events
      const trail = await prisma.$transaction(async (tx) => {
        // Delete existing trail events
        await tx.trailEvent.deleteMany({
          where: { trailId },
        });

        // Update trail and create new trail events if any
        return await tx.trail.update({
          where: { id: trailId },
          data: {
            title,
            description,
            coverImageUrl,
            ...(eventIds.length > 0 && {
              trailEvents: {
                create: eventIds.map((eventId: string, index: number) => ({
                  eventId,
                  order: index + 1,
                })),
              },
            }),
          },
          select: trailSelect,
        });
      });

      return res.status(200).json({ trail });
    }

    if (req.method === 'DELETE') {
      // Delete trail
      const existingTrail = await prisma.trail.findUnique({
        where: { id: trailId },
      });

      if (!existingTrail) {
        return res.status(404).json({
          message: 'trilha não encontrada',
        });
      }

      await prisma.trail.delete({
        where: { id: trailId },
      });

      return res.status(200).json({
        message: 'trilha deletada com sucesso',
      });
    }

    return res.status(405).json({ message: 'método não permitido' });
  } catch (err) {
    console.error('Error in trail handler:', err);
    return res.status(500).json({
      message: 'erro interno do servidor',
    });
  }
};

export default ensureAuthenticatedWithRole(trailHandler, ['ADMIN']);
