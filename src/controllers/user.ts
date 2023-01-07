import bcryptjs from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import prisma from '../config/client';
import handleValidation from '../functions/handleValidation';
import signToken from '../functions/signToken';
import { RequestError } from '../interfaces/error';
import { HttpCode } from '../interfaces/httpCode';

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    handleValidation(req);

    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 10);


    const createdUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    return res.status(HttpCode.CREATED).json({
      message: 'User created',
      data: { userId: createdUser.id },
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      message: err.message,
      data: err.data,
    });
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    handleValidation(req);

    const { email, password } = req.body;

    const registeredUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!registeredUser) {
      throw new RequestError({
        httpCode: HttpCode.NOT_FOUND,
        message: 'User not found',
      });
    }

    const isEqual = await bcryptjs.compare(password, registeredUser.password);
    if (!isEqual) {
      throw new RequestError({
        httpCode: HttpCode.UNAUTHORIZED,
        message: 'Wrong password',
      });
    }

    const token = signToken(registeredUser.email, registeredUser.id);

    res.status(HttpCode.OK).json({
      message: 'User authenticated',
      token: token,
      data: { userId: registeredUser.id },
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      message: err.message,
      data: err.data,
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
    handleValidation(req);

    const decodedToken = res.locals.jwt;
    const loggedInUser = await prisma.user.findUnique({
      where: {
        id: decodedToken.userId,
      },
    });

    if (!loggedInUser) {
      throw new RequestError({
        httpCode: HttpCode.NOT_FOUND,
        message: 'User not found',
      });
    }

    const { password, newPassword } = req.body;
    const isEqual = await bcryptjs.compare(password, loggedInUser.password);

    if (!isEqual) {
      throw new RequestError({
        httpCode: HttpCode.UNAUTHORIZED,
        message: 'Wrong password',
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
      data: { userId: updatedUser.id },
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      message: err.message,
      data: err.data,
    });
    next(error);
  }
};

export default { register, login, changePassword };
