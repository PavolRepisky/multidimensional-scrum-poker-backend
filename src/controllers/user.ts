import bcryptjs from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import prisma from '../config/client';
import config from '../config/config';
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

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    handleValidationResult(req);

    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    return res.status(HttpCode.CREATED).json({
      message: 'User created.',
      userId: user.id,
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      description: err.description || ErrorMessage.INTERNAL_SERVER_ERROR,
    });
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    handleValidationResult(req);

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new RequestError({
        httpCode: HttpCode.NOT_FOUND,
        description: 'User not found',
      });
    }

    const isEqual = await bcryptjs.compare(password, user.password);
    if (!isEqual) {
      throw new RequestError({
        httpCode: HttpCode.UNAUTHORIZED,
        description: 'Wrong password',
      });
    }

    const token = jwt.sign(
      { email: user.email, userId: user.id },
      config.server.token.secret,
      {
        issuer: config.server.token.issuer,
        algorithm: 'HS256',
        expiresIn: config.server.token.expireTime,
      }
    );

    res
      .status(HttpCode.OK)
      .json({ message: 'User authenticated', token: token, userId: user.id });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      description: err.description || ErrorMessage.INTERNAL_SERVER_ERROR,
    });
    next(error);
  }
};

const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    handleValidationResult(req);

    const decodedToken = res.locals.jwt;
    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.userId,
      },
    });

    if (!user) {
      throw new RequestError({
        httpCode: HttpCode.NOT_FOUND,
        description: 'User not found',
      });
    }

    const { password, newPassword } = req.body;

    const isEqual = await bcryptjs.compare(password, user.password);
    if (!isEqual) {
      throw new RequestError({
        httpCode: HttpCode.UNAUTHORIZED,
        description: 'Wrong password',
      });
    }

    const hashedNewPassword = await bcryptjs.hash(newPassword, 10);
    const updatedUser = await prisma.user.update({
      where: {
        id: decodedToken.userId,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    res.status(200).json({
      message: 'Password changed',
      userId: updatedUser.id,
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      description: err.description || ErrorMessage.INTERNAL_SERVER_ERROR,
    });
    next(error);
  }
};

export default { register, login, changePassword };
