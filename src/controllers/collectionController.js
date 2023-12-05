import expressAsyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import Collection from '../models/Collection.js';
import mongoose from 'mongoose';

const getCurrentUserCollections = expressAsyncHandler(
  async (req, res, next) => {
    let { page = 1, pageSize = 12, search = '' } = req.query;
    if (page < 1) {
      page = 1;
    }

    const authorizeUserID = req.user;

    const filters = {};
    if (search) {
      filters.name = { $regex: new RegExp(search, 'i') };
    }
    if (authorizeUserID) {
      filters.userID = authorizeUserID;
    }

    const collections = await Collection.find(filters)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    if (collections.length < 1) {
      return res.status(400).json({ message: 'Collection not found' });
    }

    const totalCollections = await Collection.find(filters).countDocuments();
    const totalCountPage = Math.ceil(totalCollections / pageSize);

    res.status(200).json({
      collections,
      totalCountPage,
    });
  }
);

const getRandomCollections = expressAsyncHandler(async (req, res, next) => {
  let { page = 1, pageSize = 12, search = '' } = req.query;
  if (page < 1) {
    page = 1;
  }

  const authorizeUserID = req.user;

  const filters = {};
  if (search) {
    filters.name = { $regex: new RegExp(search, 'i') };
  }
  if (authorizeUserID) {
    filters.userID = { $ne: authorizeUserID };
  }

  const collections = await Collection.find(filters)
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  if (collections.length < 1) {
    return res.status(400).json({ message: 'Collection not found' });
  }

  const totalCollections = await Collection.find(filters).countDocuments();
  const totalCountPage = Math.ceil(totalCollections / pageSize);

  res.status(200).json({
    collections,
    totalCountPage,
  });
});

const getAllCurrentUserCollection = expressAsyncHandler(
  async (req, res, next) => {
    const authorizeUserID = req.user;

    const collections = await Collection.find({
      userID: authorizeUserID,
    }).exec();

    if (collections.length < 1) {
      return res.status(400).json({ message: 'Collection not found' });
    }

    res.status(200).json(collections);
  }
);

const createNewCollection = [
  body('name')
    .escape()
    .matches(/^[a-zA-Z0-9_\.]+$/),
  body('isPrivate').escape(),
  expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // Authorize user
    const authorizeUserID = req.user;

    if (!errors.isEmpty()) {
      let errorString = errors
        .array()
        .map((item) => item.msg)
        .join(', ');

      return res.status(400).json({ message: `${errorString}` });
    }

    const { name, isPrivate } = req.body;
    // create collection
    const newCollection = new Collection({
      userID: authorizeUserID,
      name,
      isPrivate,
    });

    // save
    const savedCollection = await newCollection.save();
    res.status(200).json(savedCollection);
  }),
];

const getCurrentCollection = expressAsyncHandler(async (req, res, next) => {
  const { collectionID } = req.params;
  let { page = 1, pageSize = 12, movie = '' } = req.query;
  if (page < 1) {
    page = 1;
  }
  const skip = (page - 1) * pageSize;
  const regex = new RegExp(movie, 'i');

  const ObjectId = mongoose.Types.ObjectId;
  const result = await Collection.aggregate([
    {
      $match: { _id: new ObjectId(collectionID) },
    },
    {
      $project: {
        name: 1,
        isPrivate: 1,
        userID: 1,
        movies: {
          $filter: {
            input: '$movies',
            as: 'movie',
            cond: {
              $regexMatch: {
                input: '$$movie.name',
                regex: regex,
              },
            },
          },
        },
      },
    },
    {
      $project: {
        collectionName: '$name',
        isPrivate: '$isPrivate',
        userID: '$userID',
        movies: {
          $slice: ['$movies', skip, pageSize * page],
        },
        totalPageCount: {
          $ceil: {
            $divide: [{ $size: '$movies' }, pageSize],
          },
        },
      },
    },
  ]);

  if (result.length === 0 || result[0].movies.length < 1) {
    return res.status(404).json({ ...result[0], message: 'Movie not found' });
  }

  res.status(200).json(result[0]);
});

const updateCurrentCollection = [
  body('name')
    .matches(/^[a-zA-Z0-9_\.]+$/)
    .trim()
    .escape(),

  body('isPrivate')
    .isBoolean()
    .withMessage('Your message if not boolean')
    .escape(),

  expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      res.status(400).json({ message: 'Invalid input' });
      return;
    }

    // get action
    const { collectionID } = req.params;
    const { name, isPrivate } = req.body;
    const authorizeUserID = req.user;

    const collection = await Collection.findById(collectionID);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const ownerCollection = collection.userID;
    // Check user
    if (!ownerCollection.equals(authorizeUserID)) {
      return res.status(401).json({
        message: "You cannot update other people's collections",
      });
    }

    collection.name = name;
    collection.isPrivate = isPrivate;
    const updatedCollection = await collection.save();

    res.status(200).json(updatedCollection);
  }),
];

const deleteCollection = expressAsyncHandler(async (req, res, next) => {
  const collectionID = req.params.collectionID;
  const authorizeUserID = req.user;

  const collection = await Collection.findById(collectionID).lean().exec();
  if (!collection) {
    return res.status(404).json({ message: 'Collection not found' });
  }

  const ownerCollection = collection.userID;

  if (!ownerCollection.equals(authorizeUserID)) {
    return res
      .status(401)
      .json({ message: "You cannot delete other people's collections" });
  }

  // delete collection
  await Collection.findByIdAndDelete(collectionID);

  res.status(200).json({ message: 'successfully deleted' });
});

const addMovieToCollection = [
  body('name').trim().escape(),

  body('isMovie')
    .isBoolean()
    .withMessage('Your message if not boolean')
    .escape(),

  body('backdrop_path').escape(),
  expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // Authorize user
    const authorizeUserID = req.user;

    if (!errors.isEmpty()) {
      let errorString = errors
        .array()
        .map((item) => item.msg)
        .join(', ');

      return res.status(400).json({ message: `${errorString}` });
    }
    const { name, tmdb_id, isMovie, backdrop_path, collectionIDs } = req.body;

    if (!Array.isArray(collectionIDs)) {
      return res
        .status(400)
        .json({ message: 'collectionIDs must be an array' });
    }

    const result = await Collection.updateMany(
      {
        _id: { $in: collectionIDs },
        userID: authorizeUserID,
        movies: {
          $not: {
            $elemMatch: {
              tmdb_id: parseInt(tmdb_id, 10),
              isMovie: isMovie,
            },
          },
        },
      },
      {
        $addToSet: {
          movies: {
            name,
            tmdb_id,
            isMovie,
            backdrop_path,
          },
        },
      }
    );
    if (result.modifiedCount > 0) {
      return res.status(200).json({ message: 'Movies added to collections' });
    } else {
      return res.status(403).json({
        message: 'Failed to add movies to collections or movies already exist',
      });
    }
  }),
];

const deleteMovieFromCollection = expressAsyncHandler(
  async (req, res, next) => {
    const { collectionID, movieID } = req.params;

    const result = await Collection.updateOne(
      { _id: collectionID },
      { $pull: { movies: { _id: movieID } } }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: 'The movie has not been deleted or does not exist' });
    }

    res.status(200).json({ message: 'Movie was deleted' });
  }
);

const getMovie = expressAsyncHandler(async (req, res, next) => {
  const { collectionID, movieID } = req.params;

  const result = await Collection.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(collectionID) },
    },
    {
      $unwind: '$movies',
    },
    {
      $match: { 'movies._id': new mongoose.Types.ObjectId(movieID) },
    },
    {
      $project: {
        _id: 0,
        movie: '$movies',
      },
    },
  ]);

  if (result.length === 0 || !result[0].movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  if (result[0].movie.isMovie) {
    const movieDetails = await fetch(
      `https://api.themoviedb.org/3/movie/${result[0].movie.tmdb_id}?api_key=${process.env.TMDB_API_KEY}`
    );
    const data = await movieDetails.json();

    res.status(200).json(data);
  } else {
    const tvDetails = await fetch(
      `https://api.themoviedb.org/3/tv/${result[0].movie.tmdb_id}?api_key=${process.env.TMDB_API_KEY}`
    );
    const data = await tvDetails.json();
    res.status(200).json(data);
  }
});

export default {
  createNewCollection,
  addMovieToCollection,
  updateCurrentCollection,
  getCurrentUserCollections,
  getCurrentCollection,
  deleteCollection,
  deleteMovieFromCollection,
  getMovie,
  getRandomCollections,
  getAllCurrentUserCollection,
};
