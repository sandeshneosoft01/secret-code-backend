import Joi from 'joi';

const bugReportSchema = Joi.object({
  fullName: Joi.string()
    .optional()
    .allow('')
    .pattern(/^[a-zA-Z\s]+$/, 'valid name')
    .messages({
      'string.pattern.name': 'Please enter a valid name.',
    }),

  email: Joi.string().optional().allow('').email({ tlds: false }).messages({
    'string.email': 'Please enter a valid email.',
  }),

  title: Joi.string().min(3).required().messages({
    'string.empty': 'Bug title is required.',
    'string.min': 'Bug title must be at least 3 characters.',
  }),

  description: Joi.string().min(10).required().messages({
    'string.empty': 'Bug description is required.',
    'string.min': 'Bug description must contain at least 10 characters.',
  }),

  attachments: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().valid('image/png', 'image/jpeg', 'image/jpg', 'image/webp').messages({
          'any.only': 'File must be PNG, JPG, or WEBP',
        }),

        size: Joi.number()
          .max(1 * 1024 * 1024)
          .messages({
            'number.max': 'File too large (max 1MB)',
          }),
      }),
    )
    .max(5)
    .optional()
    .messages({
      'array.max': 'You can upload a maximum of 5 files.',
    }),
});

export default bugReportSchema;
