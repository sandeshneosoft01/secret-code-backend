import express, { Express, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import methodOverride from 'method-override';
import helmet from 'helmet';
import mongoose from 'mongoose';
import path from 'path';

import routes from './routes';
import { port, database } from './config';
import logger from '@utils/logger';
import { corsOptions } from '@middleware/cors-middleware';

function initializeApp(app: Express) {
  /**
   * Load all middleware
   */
  function middleware() {
    app.use(cors(corsOptions));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ limit: '2000mb' }));
    app.use(compression());
    app.use(methodOverride());
    app.use(
      helmet({
        frameguard: { action: 'deny' },
      }),
    );

    app.use(
      '/bug-attachments',
      express.static(path.join(__dirname, '..', 'public', 'bug-attachments')),
    );
    app.use('/public', express.static(`${__dirname}/../public`));

    app.use((_, res: Response, next: NextFunction) => {
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });
  }

  /**
   * Connect to MongoDB
   */
  async function connectDb() {
    try {
      await mongoose.connect(database.uri, {
        dbName: database.name,
      });
      logger.info('MongoDB connected successfully');
    } catch (error) {
      logger.error(new Error(`MongoDB connection error: ${error}`));
      process.exit(1); // Exit if DB connection fails
    }
  }

  /**
   * Load all routes
   */
  function loadRoutes() {
    routes(app);
  }

  /**
   * Start express server
   */
  function start() {
    const server = app.listen(port, () => {
      logger.info('Server has started on port %d', port);
    });
    return server;
  }

  // Run all setup
  middleware();
  connectDb();
  loadRoutes();
  start();
}

export default initializeApp;
