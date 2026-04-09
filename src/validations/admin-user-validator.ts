import Joi, { ValidationResult } from 'joi';

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
}

export const adminUserSchema = Joi.object<FormData>({
  firstName: Joi.string().min(1).required().messages({
    'string.empty': 'First Name is required.',
  }),

  lastName: Joi.string().min(1).required().messages({
    'string.empty': 'Last Name is required.',
  }),

  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Email must be a valid email.',
  }),

  role: Joi.string().min(1).required().messages({
    'string.empty': 'Role is required.',
  }),

  password: Joi.string()
    .required()
    .custom((value) => value.trim())
    .messages({
      'string.empty': 'Password is required.',
    }),

  confirmPassword: Joi.string()
    .required()
    .custom((value) => value.trim())
    .messages({
      'string.empty': 'Confirm Password is required.',
    }),
})
  // Password length
  .custom((data: FormData, helpers) => {
    const { password } = data;

    if (password.length < 8) {
      return helpers.error('any.custom', {
        message: 'Password must be at least 8 characters long.',
        path: ['password'],
      });
    }

    if (!/[a-z]/.test(password)) {
      return helpers.error('any.custom', {
        message: 'Password must contain at least one lowercase letter.',
        path: ['password'],
      });
    }

    if (!/\d/.test(password)) {
      return helpers.error('any.custom', {
        message: 'Password must contain at least one number.',
        path: ['password'],
      });
    }

    return data;
  })
  // Passwords must match
  .custom((data: FormData, helpers) => {
    if (data.password !== data.confirmPassword) {
      return helpers.error('any.custom', {
        message: "Passwords don't match.",
        path: ['confirmPassword'],
      });
    }
    return data;
  });
