import { NextFunction, Request, Response } from 'express';
import prisma from '../config/client';
import handleValidation from '../functions/handleValidation';
import { RequestError } from '../interfaces/error';
import { HttpCode } from '../interfaces/httpCode';

const findUserMatrix = async (userId: string, matrixId: number) => {
  const matrix = await prisma.matrix.findUnique({
    where: {
      id: matrixId,
    },
  });

  if (matrix == undefined || matrix.creatorId !== userId) {
    throw new RequestError({
      httpCode: HttpCode.NOT_FOUND,
      message: 'Matrix not found',
    });
  }
  return matrix;
};

const closeVotings = async (sessionId: number) => {
  return await prisma.voting.updateMany({
    where: {
      sessionId: sessionId,
      active: true
    },
    data: {
      active: false,
    },
  });
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { name, matrixId } = req.body;
  const decodedToken = res.locals.jwt;
  let createdSession;

  try {
    handleValidation(req);
    await findUserMatrix(decodedToken.userId, matrixId);

    createdSession = await prisma.session.create({
      data: {
        name,
        matrixId: matrixId,
        ownerId: decodedToken.userId,
      },
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      message: err.message,
      data: err.data,
    });
    return next(error);
  }

  return res.status(HttpCode.CREATED).json({
    message: 'Session created',
    data: { sessionHash: createdSession.hashId },
  });
};

const join = async (req: Request, res: Response, next: NextFunction) => {
  let joinedSession;
  try {
    joinedSession = await prisma.session.findUnique({
      where: {
        hashId: req.params.hashId,
      },
    });

    if (!joinedSession) {
      return next(
        new RequestError({
          httpCode: HttpCode.NOT_FOUND,
          message: 'Session not found',
        })
      );
    }
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      message: err.message,
      data: err.data,
    });
    return next(error);
  }

  return res.status(HttpCode.OK).json({
    message: 'Session joined',
    data: {
      sessionHash: joinedSession.hashId,
      sessionName: joinedSession.name,
    },
  });
};

const createVoting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;
  const decodedToken = res.locals.jwt;
  let createdVoting;

  try {
    handleValidation(req);

    const session = await prisma.session.findUnique({
      where: {
        hashId: req.params.hashId,
      },
    });

    if (!session || session.ownerId !== decodedToken.userId) {
      return next(
        new RequestError({
          httpCode: HttpCode.NOT_FOUND,
          message: 'Session not found',
        })
      );
    }

    await closeVotings(session.id);

    createdVoting = await prisma.voting.create({
      data: {
        name,
        active: true,
        sessionId: session.id,
      },
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      message: err.message,
      data: err.data,
    });
    return next(error);
  }

  return res.status(HttpCode.CREATED).json({
    message: 'Voting created',
    data: { votingId: createdVoting.id },
  });
};

export default { create, join, createVoting };
