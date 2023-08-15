import express from 'express'
import collectionController from '../controllers/collectionController.js'
const collectionRouter = express.Router()

collectionRouter.route('/')
// get all user collections
.get(collectionController.getAllCurrentUserCollection)
// create user collection
.post(collectionController.addNewCollection)

collectionRouter.route('/:collectionID')
// get current collection
.get(collectionController.getCurrentCollection)

// update current collection
.patch(collectionController.updateCurrentCollection)

// delete current collection
.delete()

collectionRouter.route('/:collectionID/movie')
// add new movie or tv in collection
.post(collectionController.addMovieToCollection)

// delete movie or tv in collection
.delete(collectionController.deleteMovieFromCollection)

export default collectionRouter
