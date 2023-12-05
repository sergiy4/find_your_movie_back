import supertest from 'supertest';
import db from './db.js';
import cookieParser from 'cookie-parser';
import collectionRouter from '../routes/collectionRouter.js';
import express from 'express';
import Collection from '../models/Collection';
import {
  authUserCollections,
  randomCollection,
  invalidCollectionsIds,
  validAuthUserCollectionsIds,
  validRandomCollectionsIds,
  validAuthUserMoviesIds,
  invalidMoviesIds,
} from './tests_collections_data.js';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/collections', collectionRouter);

beforeAll(async () => {
  await db.initializeMongoServer();
});
beforeEach(async () => await db.clear());
afterAll(async () => await db.close());

// verify jwt mock
jest.mock('../middleware/verifyJWT.js', () =>
  jest.fn((req, res, next) => {
    // set current user ID
    req.user = '655ce762dfbab2e024ab46f3';
    next();
  })
);

describe('collections', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('GET/collections', () => {
    describe('given collections', () => {
      beforeEach(async () => {
        await Collection.insertMany(authUserCollections);
      });

      it('should return a 200', async () => {
        await supertest(app).get('/collections').expect(200);
      });

      it('should return a 200, if page less than 1', async () => {
        await supertest(app)
          .get('/collections')
          .query({ page: -1 })
          .expect(200);
      });

      it('should return 200 if there are collections for the search', async () => {
        await supertest(app)
          .get('/collections')
          .query({ search: 'coll' })
          .expect(200);
      });

      it('should return a 400, if collection does not found', async () => {
        await supertest(app)
          .get('/collections')
          .query({ search: 'hero' })
          .expect(400);
      });

      it('should return a 400', async () => {
        await supertest(app).get('/collections').query({ page: 2 }).expect(400);
      });
    });

    describe('given collections does not exist', () => {
      it('should return a 400', async () => {
        await supertest(app).get('/collections/').expect(400);
      });
    });
  });

  describe('POST/collections', () => {
    describe('Create new collection ', () => {
      it('should return 200', async () => {
        await supertest(app)
          .post('/collections')
          .send({ name: 'New_collections', isPrivate: true })
          .expect(200);
      });

      it('When sending invalid data, should return a 400', async () => {
        await supertest(app)
          .post('/collections')
          .send({ name: 'Invalid data because contain space', isPrivate: true })
          .expect(400);
      });
    });
  });

  describe('GET/collections/all', () => {
    describe('return all auth user collections', () => {
      beforeEach(async () => {
        await Collection.insertMany(authUserCollections);
      });

      it('Should return 200', async () => {
        await supertest(app).get('/collections/all').expect(200);
      });
    });

    describe('When the user does not have any collections', () => {
      it('Should return 400', async () => {
        await supertest(app).get('/collections/all').expect(400);
      });
    });
  });

  describe('GET/collections/randomCollections', () => {
    describe('given random collections exist ', () => {
      beforeEach(async () => {
        await Collection.insertMany(randomCollection);
      });

      it('should return a 200', async () => {
        await supertest(app).get('/collections/randomCollections').expect(200);
      });

      it('should return a 200, if page less than 1', async () => {
        await supertest(app)
          .get('/collections/randomCollections')
          .query({ page: -1 })
          .expect(200);
      });

      it('should return 200 if there are collections for the search', async () => {
        await supertest(app)
          .get('/collections/randomCollections')
          .query({ search: 'coll' })
          .expect(200);
      });
    });

    describe('given collections is authorize user ', () => {
      beforeEach(async () => {
        await Collection.insertMany(authUserCollections);
      });

      it('should return 400 , because there are collections of only the authorized user', async () => {
        await supertest(app).get('/collections/randomCollections').expect(400);
      });

      it('should return a 400, because invalid query parameters', async () => {
        await supertest(app)
          .get('/collections/randomCollections')
          .query({ page: 2 })
          .expect(400);
      });
    });

    describe('given random collections does not exist', () => {
      it('should return a 400', async () => {
        await supertest(app).get('/collections/randomCollections').expect(400);
      });
    });
  });

  describe('POST/collections/movies', () => {
    describe('Add movie to collections', () => {
      beforeEach(async () => {
        await Collection.create(authUserCollections);
      });

      it('should return a 200 when success added movie', async () => {
        await supertest(app)
          .post('/collections/movies')
          .send({
            name: 'Pulp fiction',
            isMovie: true,
            tmdb_id: 1234324,
            backdrop_path: 'some/backdrop',
            collectionIDs: validAuthUserCollectionsIds,
          })
          .expect(200);
      });

      it('should return a 403 ,when invalid collections ids', async () => {
        await supertest(app)
          .post('/collections/movies')
          .send({
            name: 'Pulp fiction',
            isMovie: true,
            tmdb_id: 1234324,
            backdrop_path: 'some/backdrop',
            collectionIDs: invalidCollectionsIds,
          })
          .expect(403);
      });

      it('should return a 400 when not all data was sent', async () => {
        await supertest(app)
          .post('/collections/movies')
          .send({
            backdrop_path: 'some/backdrop',
            collectionIDs: invalidCollectionsIds,
          })
          .expect(400);
      });

      it('should return a 400, when collections ids does not exist', async () => {
        await supertest(app)
          .post('/collections/movies')
          .send({
            name: 'Pulp fiction',
            isMovie: true,
            tmdb_id: 1234324,
            backdrop_path: 'some/backdrop',
          })
          .expect(400);
      });
    });
  });

  describe('GET/collections/:collectionID', () => {
    describe('get current collection', () => {
      beforeEach(async () => {
        await Collection.insertMany(authUserCollections);
      });

      it('should return a 200', async () => {
        await supertest(app)
          .get('/collections/' + validAuthUserCollectionsIds[0])
          .expect(200);
      });

      it('should return a 200', async () => {
        await supertest(app)
          .get('/collections/' + validAuthUserCollectionsIds[0])
          .query({ page: -1 })
          .expect(200);
      });
    });

    describe('given current collection does not exist', () => {
      it('should return a 404, because the collection with such an id does not exis', async () => {
        await supertest(app)
          .get('/collections/' + invalidCollectionsIds[0])
          .expect(404);
      });
    });

    describe('given current collection does not have movie', () => {
      beforeEach(() => {
        Collection.insertMany(authUserCollections);
      });

      it('should return a 404', async () => {
        await supertest(app)
          .get('/collections/' + validAuthUserCollectionsIds[2])
          .expect(404);
      });
    });
  });

  describe('PATCH/collections/:collectionID', () => {
    describe('Update collection', () => {
      beforeEach(async () => {
        await Collection.insertMany(authUserCollections);
      });

      it('should return a 400, because send invalid data', async () => {
        await supertest(app)
          .patch('/collections/' + validAuthUserCollectionsIds[0])
          .send({
            name: 'new_name',
          })
          .expect(400);
      });

      it('should return a 200', async () => {
        await supertest(app)
          .patch('/collections/' + validAuthUserCollectionsIds[0])
          .send({
            name: 'new_name',
            isPrivate: true,
          })
          .expect(200);
      });

      it('should return a 404, because collection does not exist', async () => {
        await supertest(app)
          .patch('/collections/' + invalidCollectionsIds[0])
          .send({
            name: 'new_name',
            isPrivate: true,
          })
          .expect(404);
      });

      describe('Update collection', () => {
        beforeEach(() => {
          Collection.insertMany(randomCollection);
        });

        it('should return a 401, because the user is not the owner ', async () => {
          await supertest(app)
            .patch('/collections/' + validRandomCollectionsIds[0])
            .send({
              name: 'new_name',
              isPrivate: true,
            })
            .expect(401);
        });
      });
    });
  });

  describe('DELETE/collections/:collectionID', () => {
    describe('Delete collection', () => {
      beforeEach(async () => {
        await Collection.insertMany(authUserCollections);
      });

      it('Should return 200', async () => {
        await supertest(app)
          .delete('/collections/' + validAuthUserCollectionsIds[0])
          .expect(200);
      });

      it('Should return 404', async () => {
        await supertest(app)
          .delete('/collections/' + invalidCollectionsIds[0])
          .expect(404);
      });
    });

    describe('Failed delete collection', () => {
      beforeEach(async () => {
        await Collection.insertMany(randomCollection);
      });
      it('should return a 401, because you cannot delete other peoples collections', async () => {
        await supertest(app)
          .delete('/collections/' + validRandomCollectionsIds[0])
          .expect(401);
      });
    });
  });

  describe('GET /collections/:collectionID/movie/:movieID', () => {
    describe('Get current movie', () => {
      beforeEach(async () => {
        await Collection.insertMany(authUserCollections);
      });

      it('should return 200', async () => {
        await supertest(app)
          .get(
            '/collections/' +
              validAuthUserCollectionsIds[0] +
              '/movies/' +
              validAuthUserMoviesIds[0]
          )
          .expect(200);
      });

      it('should return 200', async () => {
        await supertest(app)
          .get(
            '/collections/' +
              validAuthUserCollectionsIds[0] +
              '/movies/' +
              validAuthUserMoviesIds[1]
          )
          .expect(200);
      });

      it('should return 404, when movie id is invalid', async () => {
        await supertest(app)
          .get(
            '/collections/' +
              validAuthUserCollectionsIds[0] +
              '/movies/' +
              invalidMoviesIds[0]
          )
          .expect(404);
      });
    });
  });

  describe('DELETE /collections/:collectionID/movie/:movieID', () => {
    describe('delete movie from collections', () => {
      beforeEach(async () => {
        await Collection.insertMany(authUserCollections);
      });

      it('should return 200', async () => {
        await supertest(app)
          .delete(
            '/collections/' +
              validAuthUserCollectionsIds[0] +
              '/movies/' +
              validAuthUserMoviesIds[0]
          )
          .expect(200);
      });

      it('should return 404, when movie id is invalid', async () => {
        await supertest(app)
          .delete(
            '/collections/' +
              validAuthUserCollectionsIds[0] +
              '/movies/' +
              invalidMoviesIds[0]
          )
          .expect(404);
      });
    });
  });
});
