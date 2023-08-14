import express from 'express'
const collectionRouter = express.Router()

collectionRouter.route('/:userId/collection')
// get all user collection
.get()
// create user collection
.post()

collectionRouter.route('/:userId/collection/:id')
// get current collection
.get()
// update current collection
.patch()
// delete current collection
.delete()

