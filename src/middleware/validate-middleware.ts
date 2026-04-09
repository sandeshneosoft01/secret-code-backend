import { getMessage } from '@utils/index';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import HttpStatus from 'http-status';
import Joi from 'joi';

interface ValidateRequestOptions {
  schema: Joi.ObjectSchema;
  validateBody?: boolean;
  validateQuery?: boolean;
  validateParams?: boolean;
}

const validateRequest = (options: ValidateRequestOptions): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { schema, validateBody = true, validateQuery = true, validateParams = true } = options;
    console.log({ options });
    let dataToValidate: any = {};

    if (validateBody) dataToValidate = { ...dataToValidate, ...req.body };
    if (validateQuery) dataToValidate = { ...dataToValidate, ...req.query };
    if (validateParams) dataToValidate = { ...dataToValidate, ...req.params };
    try {
      console.log({ dataToValidate });
      await schema.validateAsync(dataToValidate, { abortEarly: false });

      next();
    } catch (err: unknown) {
      if (err && (err as Joi.ValidationError).isJoi) {
        const joiError = err as Joi.ValidationError;

        const errors = joiError.details.map((errorDetail) => ({
          message: getMessage(req, false, errorDetail.message),
          field: errorDetail.path.join('_'),
          type: errorDetail.type,
        }));

        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          error: errors,
          message: '',
        });
        return; // explicitly stop here
      }

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        data: null,
        error: [{ message: 'Internal Server Error' }],
        message: '',
      });
    }
  };
};

export default validateRequest;
