import { getMessage } from '@utils/index';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import HttpStatus from 'http-status';
import Joi from 'joi';

interface ValidateRequestOptions {
  schema?: Joi.ObjectSchema;
  validateBody?: boolean | Joi.ObjectSchema;
  validateQuery?: boolean | Joi.ObjectSchema;
  validateParams?: boolean | Joi.ObjectSchema;
}

const validateRequest = (options: ValidateRequestOptions): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let { schema = Joi.object(), validateBody = true, validateQuery = true, validateParams = true } = options;
    let dataToValidate: any = {};

    if (validateBody) {
      if (typeof validateBody !== 'boolean') schema = schema.concat(validateBody);
      dataToValidate = { ...dataToValidate, ...req.body };
    }
    if (validateQuery) {
      if (typeof validateQuery !== 'boolean') schema = schema.concat(validateQuery);
      dataToValidate = { ...dataToValidate, ...req.query };
    }
    if (validateParams) {
      if (typeof validateParams !== 'boolean') schema = schema.concat(validateParams);
      dataToValidate = { ...dataToValidate, ...req.params };
    }

    try {
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
