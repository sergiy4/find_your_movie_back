import express from 'express'
import movieController from '../controllers/movieController.js'

const movieRouter = express.Router()

movieRouter.route('/')
.post(movieController.addMovieToCollection)
.delete(movieController.deleteMovieFromCollection)

movieRouter.route('/:movieID')
// get current Movie
.get(movieController.getCurrentMovie)


export default movieRouter