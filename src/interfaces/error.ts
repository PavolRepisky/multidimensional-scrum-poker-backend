import { HttpCode } from './httpCode';

export enum ErrorMessage {
  VALIDATION_FAILED = 'Validation failed.',
  INTERNAL_SERVER_ERROR = 'The server encountered an error and could not complete your request.',
  UNAUTHORIZED = 'Unauthorized',
}

interface RequestErrorArgs {
  name?: string;
  httpCode: HttpCode;
  description: string;
}

export class RequestError extends Error {
  public readonly name: string;
  public readonly httpCode: HttpCode;

  constructor(args: RequestErrorArgs) {
    super(args.description);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = args.name || 'Error';
    this.httpCode = args.httpCode;

    Error.captureStackTrace(this);
  }
}
