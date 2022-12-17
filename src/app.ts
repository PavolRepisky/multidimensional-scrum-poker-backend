import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { RequestError } from './interfaces/error';
import { HttpCode } from './interfaces/httpCode';
import userRoutes from './routes/user';

export const app = express();

/* Request body parsing */
app.use(express.json());

/* Logging */
app.use(morgan('dev'));

/** API Rules */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

/** Routes */
app.use('/users', userRoutes);

/** Error handling */
app.use((err: RequestError | Error, req: Request, res: Response, next: NextFunction) => {
  res
    .status(err instanceof RequestError ? err.httpCode : HttpCode.INTERNAL_SERVER_ERROR)
    .json({ message: err.message });
});
