import express from 'express';
import collectionController from '../controllers/collectionController.js';
import verifyJWT from '../middleware/verifyJWT.js';
const collectionRouter = express.Router();

collectionRouter.use(verifyJWT);

collectionRouter
  .route('/')
  .get(collectionController.getCurrentUserCollections)
  .post(collectionController.createNewCollection);

collectionRouter
  .route('/all')
  .get(collectionController.getAllCurrentUserCollection);

collectionRouter
  .route('/randomCollections')
  .get(collectionController.getRandomCollections);

collectionRouter
  .route('/movies')
  .post(collectionController.addMovieToCollection);

collectionRouter
  .route('/:collectionID')
  .get(collectionController.getCurrentCollection)
  .patch(collectionController.updateCurrentCollection)
  .delete(collectionController.deleteCollection);

collectionRouter
  .route('/:collectionID/movies/:movieID')
  .get(collectionController.getMovie)
  .delete(collectionController.deleteMovieFromCollection);

export default collectionRouter;
