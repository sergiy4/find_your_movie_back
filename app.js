import createError from 'http-errors';
import express from 'express';
import path from 'path';
import logger from 'morgan';
import { fileURLToPath } from 'url';

import configPassport from './config/passport.js';
import passport from 'passport';
import 'dotenv/config'

import authRouter from './routes/authRouter.js';
import movieRouter from './routes/movieRouter.js';
import collectionRouter from './routes/collectionRouter.js';
import isAuth from './middleware/isAuth.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express();


//-----------------MONGOOSE CONNECT---------- 
 
import mongoose from 'mongoose' 
// Строгий режим забороняє вставляти документи , які не відповідються
// схемі
mongoose.set("strictQuery", false); 
 
const dbOptions = { 
  useUnifiedTopology: true,  
  useNewUrlParser: true 
} 
 
async function main() { 
  await mongoose.connect(process.env.MONGO,dbOptions); 
  console.log('Connect to MongoDB') 
}


// Wait for database to connect, logging an error if there is a problem 
main().catch((err) => console.log(err)); 
// 
// passport 
configPassport(passport)
app.use(passport.initialize())

// middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
app.use('/auth',authRouter)
app.use('/movie',movieRouter)
app.use('/collection' ,isAuth, collectionRouter)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  console.log(err.message)
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

});

export default app
