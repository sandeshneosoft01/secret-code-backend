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
    )
    .optional(),
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

export const updateMessageParamsSchema: ObjectSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'MESSAGE_ID_REQUIRED',
    'any.required': 'MESSAGE_ID_REQUIRED',
  }),
});

export const updateMessageSchema: ObjectSchema = Joi.object({
  content: Joi.string().optional().messages({
    'string.empty': 'MESSAGE_CONTENT_REQUIRED',
  }),
  emailLists: Joi.array()
    .items(
      Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: false } })
    )
    .optional(),
  code: Joi.string().length(6).optional().messages({
    'string.length': 'CODE_MUST_BE_6_DIGITS',
  }),
  expiryTime: Joi.string()
    .valid('10m', '1h', '1d', 'never', 'custom')
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

export const bulkMessagesSchema: ObjectSchema = Joi.object({
  ids: Joi.array().items(Joi.string().required()).min(1).required().messages({
    'array.min': 'AT_LEAST_ONE_MESSAGE_REQUIRED',
    'any.required': 'MESSAGE_IDS_REQUIRED',
  }),
});
