import expressAsyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import Collection from '../models/Collection.js';
import mongoose from 'mongoose';
const getAllCurrentUserCollections = expressAsyncHandler(
  async (req, res, next) => {
    let { page = 1, pageSize = 12, search = '' } = req.query;
    if (page < 1) {
      page = 1;
    }
    const authorizeUserID = req.user._id;

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
    const totalPageCount = Math.ceil(totalCollections / pageSize);

    if (page > totalPageCount) {
      return res.status(404).json({ message: 'This page does not exist' });
    }

    res.status(200).json({
      collections,
      totalPageCount,
    });
  }
);

const createNewCollection = [
  body('name').escape(),
  body('isPrivate').escape(),
  expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // Authorize user
    const authorizeUserID = req.user._id;

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

    if (!savedCollection) {
      return res.status(400).json({ message: 'Failed to create' });
    }

    res.status(200).json(savedCollection);
  }),
];

const getCurrentCollection = expressAsyncHandler(async (req, res, next) => {
  const { collectionID } = req.params;
  let { page = 1, pageSize = 12, search = '' } = req.query;
  if (page < 1) {
    page = 1;
  }
  const skip = (page - 1) * pageSize;
  const regex = new RegExp(search, 'i');

  const ObjectId = mongoose.Types.ObjectId;
  const result = await Collection.aggregate([
    {
      $match: { _id: new ObjectId(collectionID) },
    },
    {
      $project: {
        name: 1,
        isPrivate: 1,
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
        paginatedMovies: {
          $slice: ['$movies', skip, pageSize * page],
        },
      },
    },
  ]);

  if (result.length === 0 || result[0].paginatedMovies.length < 1) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  res.status(200).json(result);
});

const updateCurrentCollection = [
  body('name').trim().escape(),

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
    const authorizeUserID = req.user._id;

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
  const authorizeUserID = req.user._id;

  const collection = await Collection.findById(collectionID).lean().exec();
  if (!collection) {
    return res.status(404).json({ message: 'Collection not found' });
  }

  const ownerCollection = collection.userID;
  if (!ownerCollection.equals(authorizeUserID)) {
    return res.status(401).json("You cannot delete other people's collections");
  }

  // delete collection
  await Collection.findByIdAndDelete(collectionID);

  res.status(200).json({ message: 'successfully deleted' });
});

const addMovieToCollection = [
  body('name')
    .trim()
    // .matches(/^[a-zA-Z0-9 :.,!?#$%"''-]*$/)
    // .customSanitizer(value=>value?.toLowerCase())
    .escape(),

  body('isMovie')
    .isBoolean()
    .withMessage('Your message if not boolean')
    .escape(),

  body('tmdb_id')
    .matches(/^[0-9]+$/)
    .withMessage('Input must contain only digits'),

  body('backdrop_path').escape(),
  expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // Authorize user
    const authorizeUserID = req.user._id;

    if (!errors.isEmpty()) {
      let errorString = errors
        .array()
        .map((item) => item.msg)
        .join(', ');

      return res.status(400).json({ message: `${errorString}` });
    }
    const { collectionID } = req.params;
    const { name, tmdb_id, isMovie, backdrop_path } = req.body;

    const collection = await Collection.findById(collectionID);
    if (!collection.userID.equals(authorizeUserID)) {
      return res
        .status(403)
        .json({ message: `You cannot add movies to this collection` });
    }

    collection.movies.push({
      name,
      tmdb_id,
      isMovie,
      backdrop_path,
    });

    const savedCollection = await collection.save();
    if (!savedCollection) {
      return res.status(400).json({ message: 'Failed to create' });
    }
    res.status(200).json(savedCollection);
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

    res.json({ message: 'Movie was deleted' });
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
  getAllCurrentUserCollections,
  getCurrentCollection,
  deleteCollection,
  deleteMovieFromCollection,
  getMovie,
};
