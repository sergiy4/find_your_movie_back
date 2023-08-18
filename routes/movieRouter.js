import express from 'express'
import movieController from '../controllers/movieController.js'

const movieRouter = express.Router()

movieRouter.route('/')
.get(movieController.findMovie)
.post(movieController.addMovieToCollection)
.delete(movieController.deleteMovieFromCollection)


export default movieRouter