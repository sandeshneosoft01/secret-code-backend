import Joi, { ObjectSchema } from 'joi';

export const createWorkspaceSchema: ObjectSchema = Joi.object({
  name: Joi.string().min(1).min(3).max(50).required().messages({
    'string.empty': 'Workspace name is required',
    'string.min': 'Workspace name must be at least 3 characters',
    'string.max': 'Workspace name must be less than 50 characters',
    'any.required': 'Workspace name is required',
  }),

  description: Joi.string().min(1).min(10).max(500).required().messages({
    'string.empty': 'Workspace description is required',
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description must be less than 500 characters',
    'any.required': 'Workspace description is required',
  }),

  users: Joi.array()
    .items(
      Joi.string()
        .email({ tlds: { allow: false } })
        .messages({
          'string.email': 'Invalid email format',
        }),
    )
    .optional(),
});
