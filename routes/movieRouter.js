import express from 'express'
import movieController from '../controllers/movieController.js'

const movieRouter = express.Router()

movieRouter.route('/')
.get(movieController.findMovie)

export default movieRouter