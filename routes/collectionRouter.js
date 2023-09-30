import express from 'express'
import collectionController from '../controllers/collectionController.js'
import verifyJWT from '../middleware/verifyJWT.js'

const collectionRouter = express.Router()


// переставити нагору потім
collectionRouter.use(verifyJWT)

collectionRouter.route('/page/:page/findCollections/:inputValue?')
.get(collectionController.searchCurrentUserCollectionPagination)
// .get(collectionController.)

collectionRouter.route('/page/:page/findRandomCollections/:inputValue?')
.get(collectionController.searchRandomCollectionPagination)

collectionRouter.route('/page/:page')
.get(collectionController.getCurrentUserCollectionPagination)

collectionRouter.route('/randomCollections')
// get random private collections
.get(collectionController.getRandomCollections)

collectionRouter.route('/')
// get all user collections
.get(collectionController.getAllCurrentUserCollection)

// create user collection
.post(collectionController.createNewCollection)


collectionRouter.route('/:collectionID')
// get current collection
.get(collectionController.getCurrentCollection)

// update current collection
.patch(collectionController.updateCurrentCollection)

// delete current collection
.delete(collectionController.deleteCollection)



export default collectionRouter
