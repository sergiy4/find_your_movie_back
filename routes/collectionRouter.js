import express from 'express';
import collectionController from '../controllers/collectionController.js';
import verifyJWT from '../middleware/verifyJWT.js';

const collectionRouter = express.Router();

// переставити нагору потім
collectionRouter.use(verifyJWT);

collectionRouter
  .route('/')
  .get(collectionController.getAllCurrentUserCollections)
  .post(collectionController.createNewCollection);

collectionRouter
  .route('/:collectionID')
  .get(collectionController.getCurrentCollection)
  .patch(collectionController.updateCurrentCollection)
  .delete(collectionController.deleteCollection);

collectionRouter
  .route('/:collectionID/movies')
  .post(collectionController.addMovieToCollection);

collectionRouter
  .route('/:collectionID/movies/:movieID')
  .delete(collectionController.deleteMovieFromCollection)
  .get(collectionController.getMovie);

export default collectionRouter;
