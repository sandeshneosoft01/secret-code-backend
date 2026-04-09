import { Router } from 'express';

import authMiddleware from '@middleware/auth-middleware';
import tasksController from '@controllers/tasks-controller';
import validateRequest from '@middleware/validate-middleware';
import { taskCreateSchema } from '@validations/task-validator';

const router = Router();

// ===================== ROUTES ===================== //

router
  .route('/tasks')
  .get(authMiddleware, tasksController.getTaskList)
  .post(
    authMiddleware,
    validateRequest({ schema: taskCreateSchema, validateParams: false, validateQuery: false }),
    tasksController.createTask,
  )
  .patch(
    authMiddleware,
    validateRequest({ schema: taskCreateSchema, validateParams: false, validateQuery: false }),
    tasksController.updateTask,
  )
  .delete(authMiddleware, tasksController.deleteTask);

// ===================== ROUTES ===================== //

export default router;
