import express from "express";
import FYMController from "../controllers/FYMController.js";

const FYMRouter = express.Router()

FYMRouter.route('/')
.get(FYMController.findMovie)


export default FYMRouter