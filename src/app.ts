import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { IError } from './interfaces/error';
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
app.use((err: IError, req: Request, res: Response, next: NextFunction) => {
  res
    .status(err.statusCode || 500)
    .json({ message: err.message, data: err.data });
});
