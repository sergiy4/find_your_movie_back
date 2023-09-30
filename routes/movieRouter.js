import express from 'express'
import movieController from '../controllers/movieController.js'
import verifyJWT from '../middleware/verifyJWT.js'

const movieRouter = express.Router()

movieRouter.use(verifyJWT)

movieRouter.route('/')
.post(movieController.addMovieToCollection)
.delete(movieController.deleteMovieFromCollection)

movieRouter.route('/:movieID')
// get current Movie
.get(movieController.getCurrentMovie)


export default movieRouter