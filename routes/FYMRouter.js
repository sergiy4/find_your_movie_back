import express from "express";
import FYMController from "../controllers/FYMController.js";

const FYMRouter = express.Router()

FYMRouter.route('/')
.post(FYMController.findMovie)


export default FYMRouter