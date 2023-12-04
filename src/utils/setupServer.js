import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';

import cookieParser from 'cookie-parser';
import 'dotenv/config';
import errorHandler from '../middleware/errorHandler.js';

import cors from 'cors';
import corsOptions from '../../config/corsOption.js';

import authRouter from '../routes/authRouter.js';
import collectionRouter from '../routes/collectionRouter.js';
import FYMRouter from '../routes/FYMRouter.js';

function setupServer() {
  const app = express();

  app.use(cors(corsOptions));

  // middleware
  app.use(logger('dev'));

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // ROUTES
  app.use('/auth', authRouter);
  app.use('/FYM', FYMRouter);
  app.use('/collections', collectionRouter);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(errorHandler);

  return app;
}

export default setupServer;
