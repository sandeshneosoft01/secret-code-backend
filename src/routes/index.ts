import { Router, Request, Response, Express } from 'express';
import HttpStatus from 'http-status';

// Routes
import account from './account-route';
import adminUser from './admin-user-route';
import notification from './notification-route';
import tasks from './tasks-route';
import bugRoute from './bug-route';

import { errorHandler } from '@middleware/errorHandler-middleware';

const router = Router();

const apiRoutes = [account, adminUser, notification, tasks, bugRoute];

const register = (app: Express): void => {
  app.use(router);

  // Register API routes
  router.use('/api/v1/', apiRoutes);

  router.get('/health', (_: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Handle 404
  app.use((_, res: Response) => {
    res.status(HttpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: {},
      message: 'Not Found',
    });
  });

  // Global error handler
  app.use(errorHandler);
};

export default register;
