import { HttpCode } from './httpCode';

export enum ErrorMessage {
  VALIDATION_FAILED = 'Validation failed.',
  INTERNAL_SERVER_ERROR = 'The server encountered an error and could not complete your request.',
  UNAUTHORIZED = 'Unauthorized',
}

interface RequestErrorArgs {
  name?: string;
  httpCode: HttpCode;
  message: string;
  data?: Record<string, unknown>;
}

export class RequestError extends Error {
  public readonly name: string;
  public readonly httpCode: HttpCode;
  public readonly data?: Record<string, unknown>;

  constructor(args: RequestErrorArgs) {
    super(args.message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = args.name || 'Error';
    this.httpCode = args.httpCode;

    if (args.data) {
      this.data = args.data;
    }

    Error.captureStackTrace(this);
  }
}
