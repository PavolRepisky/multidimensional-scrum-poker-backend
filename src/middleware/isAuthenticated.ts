import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { ErrorMessage, RequestError } from '../interfaces/error';
import { HttpCode } from '../interfaces/httpCode';

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new RequestError({
        httpCode: HttpCode.UNAUTHORIZED,
        message: ErrorMessage.UNAUTHORIZED,
      });
    }

    jwt.verify(token, config.server.token.secret, (error, decoded) => {
      if (error) {
        throw new RequestError({
          httpCode: HttpCode.UNAUTHORIZED,
          message: ErrorMessage.UNAUTHORIZED,
        });
      } else {
        res.locals.jwt = decoded;
        next();
      }
    });
  } catch (err: any) {
    const error = new RequestError({
      httpCode: err.httpCode || HttpCode.INTERNAL_SERVER_ERROR,
      message: err.message || ErrorMessage.INTERNAL_SERVER_ERROR,
    });
    next(error);
  }
};
