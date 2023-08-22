import express from "express";
import authController from "../controllers/authController.js";

const authRouter = express.Router()


authRouter.post('/register', authController.register)
authRouter.post('/refresh', authController.refresh)
authRouter.post('/login',authController.login)
authRouter.post('/logout', authController.logOut)

export default authRouter