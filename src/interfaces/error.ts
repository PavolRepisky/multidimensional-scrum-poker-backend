import { ValidationError } from 'express-validator';

export interface IError extends Error {
  statusCode?: number;
  message: string;
  data?: Array<Error | ValidationError>;
}
