import createError from 'http-errors';
import express from 'express';
import path from 'path';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import errorHandler from './middleware/errorHandler.js';

import connectDB from './config/dbConfig.js';
import mongoose from 'mongoose';

import cors from 'cors';
import corsOptions from './config/corsOption.js';

import authRouter from './routes/authRouter.js';
import collectionRouter from './routes/collectionRouter.js';
import FYMRouter from './routes/FYMRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;
//-----------------MONGOOSE CONNECT----------

// connect to MongoDB
connectDB();

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

mongoose.connection.once('open', () => {
  console.log('connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

mongoose.connection.on('error', (err) => {
  console.log(err);
});
