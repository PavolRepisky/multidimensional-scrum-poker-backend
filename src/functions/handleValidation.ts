import { Request } from 'express';
import { validationResult } from 'express-validator';
import { ErrorMessage, RequestError } from '../interfaces/error';
import { HttpCode } from '../interfaces/httpCode';

const handleValidation = (req: Request) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestError({
      httpCode: HttpCode.BAD_REQUEST,
      message: ErrorMessage.VALIDATION_FAILED,
      data: { errors: errors.array() },
    });
  }
};

export default handleValidation;
