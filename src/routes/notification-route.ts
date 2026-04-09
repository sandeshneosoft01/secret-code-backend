import { Router } from 'express';

import authMiddleware from '@middleware/auth-middleware';
import notificationController from '@controllers/notification-controller';

const router = Router();

// ===================== ROUTES ===================== //

router
  .route('/notifications')
  .get(authMiddleware, notificationController.getNotificationList)
  .post(authMiddleware, notificationController.updateNotificationStatus);

// ===================== ROUTES ===================== //

export default router;
