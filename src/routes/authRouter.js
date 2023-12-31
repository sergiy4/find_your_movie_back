import express from 'express';
import authController from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/signUp', authController.register);
authRouter.get('/refresh', authController.refresh);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logOut);

export default authRouter;
