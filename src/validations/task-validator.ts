import Joi from 'joi';

export const taskCreateSchema = Joi.object({
  title: Joi.string().min(1).max(50).required().messages({
    'string.empty': 'Title is required.',
  }),
  description: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Description is required.',
  }),
  status: Joi.string().valid('pending', 'in-progress', 'completed').required(),
  priority: Joi.string().valid('low', 'medium', 'high').required(),
  assignTo: Joi.string().allow('').optional(),
  isAdmin: Joi.boolean().required(),
})
  .custom((value, helpers) => {
    if (value.isAdmin && (!value.assignTo || value.assignTo.length === 0)) {
      return helpers.error('any.custom', {
        message: 'Please select a user to assign the task to.',
      });
    }
    return value;
  })
  .messages({
    'any.custom': 'Please select a user to assign the task to.',
  });
