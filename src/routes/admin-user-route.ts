import adminUserContoller from '@controllers/admin-user-contoller';
import authMiddleware from '@middleware/auth-middleware';
import validateRequest from '@middleware/validate-middleware';
import { adminUserSchema } from '@validations/admin-user-validator';
import { Router } from 'express';

const router = Router();

// ===================== ROUTES ===================== //

router
  .route('/admin/users')
  .get(authMiddleware, adminUserContoller.getUsersList)
  .post(authMiddleware, validateRequest({ schema: adminUserSchema }), adminUserContoller.createUser)
  .patch(authMiddleware, adminUserContoller.updateUser)
  .delete(authMiddleware, adminUserContoller.deleteUser);

router.route('/admin/stats').get(authMiddleware, adminUserContoller.getDashboardStats);

// ===================== ROUTES ===================== //

export default router;
