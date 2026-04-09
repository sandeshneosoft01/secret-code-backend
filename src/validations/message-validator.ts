import Joi, { ObjectSchema } from 'joi';

export const createMessageSchema: ObjectSchema = Joi.object({
  content: Joi.string().required().messages({
    'string.empty': 'MESSAGE_CONTENT_REQUIRED',
    'any.required': 'MESSAGE_CONTENT_REQUIRED',
  }),
  emailLists: Joi.array()
    .items(
      Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: false } })
        .required(),
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'AT_LEAST_ONE_EMAIL_REQUIRED',
      'any.required': 'EMAIL_LIST_REQUIRED',
    }),
  code: Joi.string().length(6).required().messages({
    'string.length': 'CODE_MUST_BE_6_DIGITS',
    'any.required': 'CODE_REQUIRED',
  }),
  expiryTime: Joi.string()
    .valid('10m', '1h', '1d', 'never', 'custom')
    .default('10m')
    .optional(),
  customExpiryValue: Joi.string().when('expiryTime', {
    is: 'custom',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  customExpiryUnit: Joi.string()
    .valid('m', 'h', 'd')
    .when('expiryTime', {
      is: 'custom',
      then: Joi.string().required(),
      otherwise: Joi.string().optional(),
    }),
});
