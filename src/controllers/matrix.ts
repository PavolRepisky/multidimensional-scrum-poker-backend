import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/client';
import { ErrorMessage, RequestError } from '../interfaces/error';
import { HttpCode } from '../interfaces/httpCode';

const handleValidationResult = (req: Request) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestError({
      httpCode: HttpCode.BAD_REQUEST,
      description: ErrorMessage.VALIDATION_FAILED,
    });
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    handleValidationResult(req);
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      description: err.description || err.message,
    });
    return next(error);
  }

  const { name, size, values } = req.body;

  if (new Set(values).size !== values.length) {
    const error = new RequestError({
      httpCode: HttpCode.BAD_REQUEST,
      description: 'Values must be unique',
    });
    return next(error);
  }

  if (size[0] * size[1] != values.length) {
    const error = new RequestError({
      httpCode: HttpCode.BAD_REQUEST,
      description: 'Sizes do not match',
    });
    return next(error);
  }

  const decodedToken = res.locals.jwt;
  let matrix;

  try {
    matrix = await prisma.matrix.create({
      data: {
        name,
        size,
        values,
        creatorId: decodedToken.userId,
      },
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: err.message,
    });
    return next(error);
  }

  return res.status(HttpCode.CREATED).json({
    message: 'Matrix created',
    matrixId: matrix.id,
  });
};

const edit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    handleValidationResult(req);
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      description: err.description || err.message,
    });
    return next(error);
  }

  const { name, size, values } = req.body;

  if (new Set(values).size !== values.length) {
    const error = new RequestError({
      httpCode: HttpCode.BAD_REQUEST,
      description: 'Values must be unique',
    });
    return next(error);
  }

  if (size[0] * size[1] != values.length) {
    const error = new RequestError({
      httpCode: HttpCode.BAD_REQUEST,
      description: 'Sizes do not match',
    });
    return next(error);
  }

  const decodedToken = res.locals.jwt;
  let matrix;

  try {
    matrix = await prisma.matrix.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (matrix == undefined || matrix.creatorId != decodedToken.userId) {
      const error = new RequestError({
        httpCode: HttpCode.NOT_FOUND,
        description: 'Matrix not found',
      });
      return next(error);
    }

    matrix = await prisma.matrix.update({
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
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: err.message,
    });
    return next(error);
  }

  return res.status(HttpCode.OK).json({
    message: 'Matrix updated',
    matrixId: matrix.id,
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
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: err.message,
    });
    return next(error);
  }

  return res.status(HttpCode.OK).json({
    message: 'Matrices listed',
    matrices: userMatrices,
  });
};

const view = async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = res.locals.jwt;
  let matrix;

  try {
    matrix = await prisma.matrix.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: JSON.stringify(req.params),
    });
    return next(error);
  }

  if (matrix == undefined || matrix.creatorId != decodedToken.userId) {
    const error = new RequestError({
      httpCode: HttpCode.NOT_FOUND,
      description: 'Matrix not found',
    });
    return next(error);
  }

  return res.status(HttpCode.OK).json({
    message: 'Matrix found',
    matrix,
  });
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = res.locals.jwt;
  let matrix;

  try {
    matrix = await prisma.matrix.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: err.message,
    });
    return next(error);
  }

  if (matrix == undefined || matrix.creatorId != decodedToken.userId) {
    const error = new RequestError({
      httpCode: HttpCode.NOT_FOUND,
      description: 'Matrix not found',
    });
    return next(error);
  }

  try {
    matrix = await prisma.matrix.delete({
      where: {
        id: Number(req.params.id),
      },
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: err.message,
    });
    return next(error);
  }

  return res.status(HttpCode.OK).json({
    message: 'Matrix deleted',
    matrix,
  });
};

export default { create, edit, list, view, remove };
