import { Router, Request, Response, Express } from 'express';
import HttpStatus from 'http-status';

// Routes
import account from './account-route';
import messageRoute from './message-route';

import { errorHandler } from '@middleware/errorHandler-middleware';

const router = Router();

const apiRoutes = [
  { path: '/', route: account },
  { path: '/messages', route: messageRoute },
];

const register = (app: Express): void => {
  app.use(router);

  // Register API routes
  apiRoutes.forEach((route) => {
    router.use(`/api/v1${route.path}`, route.route);
  });

  router.get('/health', (_: Request, res: Response) => {
    res.status(HttpStatus.OK).json({
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
