import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { IError } from '../interfaces/error';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    const error = new Error('Unauthorized') as IError;
    error.statusCode = 401;
    throw error;
  }

  jwt.verify(token, config.server.token.secret, (error, decoded) => {
    if (error) {
      const error = new Error('Unauthorized') as IError;
      error.statusCode = 401;
      throw error;
    } else {
      res.locals.jwt = decoded;
      next();
    }
  });
};
