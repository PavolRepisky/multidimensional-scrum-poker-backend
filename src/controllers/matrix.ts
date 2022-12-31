import { NextFunction, Request, Response } from 'express';
import prisma from '../config/client';
import handleValidation from '../functions/handleValidation';
import { RequestError } from '../interfaces/error';
import { HttpCode } from '../interfaces/httpCode';

const findUserMatrix = async (userId: string, matrixId: number) => {
  const matrix = await prisma.matrix.findUnique({
    where: {
      id: Number(matrixId),
    },
  });

  if (matrix == undefined || matrix.creatorId != userId) {
    throw new RequestError({
      httpCode: HttpCode.NOT_FOUND,
      message: 'Matrix not found',
    });
  }
  return matrix;
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    handleValidation(req);
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      message: err.message,
      data: err.data,
    });
    return next(error);
  }

  const { name, size, values } = req.body;
  const decodedToken = res.locals.jwt;
  let createdMatrix;

  try {
    createdMatrix = await prisma.matrix.create({
      data: {
        name,
        size,
        values,
        creatorId: decodedToken.userId,
      },
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      message: err.message,
    });
    return next(error);
  }

  return res.status(HttpCode.CREATED).json({
    message: 'Matrix created',
    data: { matrixId: createdMatrix.id },
  });
};

const edit = async (req: Request, res: Response, next: NextFunction) => {
  let updatedMatrix;

  try {
    handleValidation(req);

    const { name, size, values } = req.body;
    const decodedToken = res.locals.jwt;

    await findUserMatrix(decodedToken.userId, Number(req.params.id));
    updatedMatrix = await prisma.matrix.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        name,
        size,
        values,
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

  return res.status(HttpCode.OK).json({
    message: 'Matrix updated',
    data: { matrixId: updatedMatrix.id },
  });
};

const list = async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = res.locals.jwt;
  let userMatrices;

  try {
    userMatrices = await prisma.matrix.findMany({
      where: {
        creatorId: decodedToken.userId,
      },
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      message: err.message,
    });
    return next(error);
  }

  return res.status(HttpCode.OK).json({
    message: 'Matrices listed',
    data: { matrices: userMatrices },
  });
};

const view = async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = res.locals.jwt;
  let matrix;

  try {
    matrix = await findUserMatrix(decodedToken.userId, Number(req.params.id));
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      message: JSON.stringify(req.params),
    });
    return next(error);
  }

  return res.status(HttpCode.OK).json({
    message: 'Matrix found',
    data: { matrix },
  });
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = res.locals.jwt;
  let matrix;

  try {
    matrix = await findUserMatrix(decodedToken.userId, Number(req.params.id));

    matrix = await prisma.matrix.delete({
      where: {
        id: Number(req.params.id),
      },
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      message: err.message,
    });
    return next(error);
  }

  return res.status(HttpCode.OK).json({
    message: 'Matrix deleted',
    data: { matrix },
  });
};

export default { create, edit, list, view, remove };
