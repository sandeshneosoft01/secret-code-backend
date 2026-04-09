// src/routes/account.routes.ts
import { Router } from 'express';

import accountController from '@controllers/account-controller';
import validateRequest from '@middleware/validate-middleware';
import { userCreateSchema } from '@validations/account-validator';
import authMiddleware from '@middleware/auth-middleware';

// Extract dependencies with proper typing
const router = Router();

// ===================== ROUTES ===================== //

// Signup route
router.post('/signup', validateRequest({ schema: userCreateSchema }), accountController.userSignup);
router.post('/signup/google', accountController.userSignupWithGoogle);

// Signin route
router.post('/signin', accountController.userSignin);
router.post('/signin/google', accountController.userSigninWithGoogle);

router.get('/profile-details', authMiddleware, accountController.getUserDetail);

// ===================== ROUTES ===================== //

export default router;
