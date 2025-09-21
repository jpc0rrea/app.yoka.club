import type { NextApiRequest, NextApiResponse } from 'next';
import { createUploadthing, type FileRouter } from 'uploadthing/next-legacy';

import { prisma } from '@server/db';
import session from '@models/session';
import user from '@models/user';
import { UnauthorizedError } from '@errors/index';

const f = createUploadthing();

const authRequest = async (req: NextApiRequest, _res: NextApiResponse) => {
  const sessionObject = await session.findOneValidFromRequest({
    req,
  });

  const userObject = await user.findOneById({
    userId: sessionObject.userId,
    prismaInstance: prisma,
  });

  return userObject;
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req, res }) => {
      // This code runs on your server before upload
      const user = await authRequest(req, res);

      // If you throw, the user will not be able to upload
      if (!user) {
        throw new UnauthorizedError({
          message: 'você precisa estar logado para fazer upload de imagens.',
        });
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Upload complete for userId:', metadata.userId);

      console.log('file url', file.url);

      await user.updateProfilePicture({
        userId: metadata.userId,
        profilePictureUrl: file.url,
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
