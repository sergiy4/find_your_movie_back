import express from 'express'
import collectionController from '../controllers/collectionController.js'
import verifyJWT from '../middleware/verifyJWT.js'

const collectionRouter = express.Router()

collectionRouter.use(verifyJWT)

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
