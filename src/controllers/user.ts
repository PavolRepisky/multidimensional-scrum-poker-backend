import bcryptjs from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import prisma from '../config/client';
import config from '../config/config';
import { IError } from '../interfaces/error';

const register = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      throw new Error('Validation failed');
    }

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

    return res.status(201).json({
      message: 'User created',
      userId: user.id,
    });
  } catch (err: any) {
    const error = new Error(err.message) as IError;
    error.statusCode = 400;
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error('User does not exist');
    }

    const isEqual = await bcryptjs.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Wrong password');
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

    res.status(200).json({ token: token, userId: user.id });
  } catch (err: any) {
    const error = new Error(err.message) as IError;
    error.statusCode = 400;
    next(error);
  }
};

const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed') as IError;
      error.data = errors.array();
      throw error;
    }

    const decodedToken = res.locals.jwt;
    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.userId,
      },
    });

    if (!user) {
      throw Error('User does not exists');
    }

    const { password, newPassword } = req.body;

    const isEqual = await bcryptjs.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Wrong password');
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

    res
      .status(200)
      .json({
        message: 'Password changed successfully',
        userId: updatedUser.id,
      });
  } catch (err: any) {
    const error = new Error(err.message) as IError;
    error.statusCode = 400;
    next(error);
  }
};

export default { register, login, changePassword };
