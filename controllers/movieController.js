import expressAsyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import fetch from "node-fetch";
import Collection from "../models/Collection.js";
import User from "../models/User.js";
import Movie from "../models/Movie.js";

const getCurrentMovie = expressAsyncHandler(async (req, res, next) => {
    console.log("MOVIE FUCK");
    let { movieID } = req.params;
    console.log(movieID);
    // movieID = parseInt(movieID)

    // console.log(movieID)

    const movie = await Movie.findById(movieID);
    console.log(movie);
    if (!movie) {
        res.status(404).json({ message: "Movie not found" });
    }

    if (movie.isMovie) {
        const movieDetails = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.tmdb_id}?api_key=${process.env.TMDB_API_KEY}`
        );
        const data = await movieDetails.json();

        res.status(200).json(data);
    } else {
        const tvDetails = await fetch(
            `https://api.themoviedb.org/3/tv/${movie.tmdb_id}?api_key=${process.env.TMDB_API_KEY}`
        );
        const data = await tvDetails.json();
        res.status(200).json(data);
    }
});

// "name":"dickssdfs Movie",
// "isMovie":true,
// "tmdb_id":1221,
// "collectionsID":["64db438045fb5f4d04c19654"]
const addMovieToCollection = [
    body("name")
        .trim()
        // .matches(/^[a-zA-Z0-9 :.,!?#$%"''-]*$/)
        // .customSanitizer(value=>value?.toLowerCase())
        .escape(),

    body("isMovie")
        .isBoolean()
        .withMessage("Your message if not boolean")
        .escape(),

    body("tmdb_id")
        .matches(/^[0-9]+$/)
        .withMessage("Input must contain only digits"),

    body("backdrop_path").escape(),

    expressAsyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        console.log(req.body);

        if (!errors.isEmpty()) {
            console.log(errors);
            res.status(400).json({ message: "Invalid input" });
            return;
        }

        // an array of ids of collections that have not yet been added
        const { name, tmdb_id, isMovie, collectionsID, backdrop_path } =
            req.body;

        // let's check if our movie exists
        const existingMovie = await Movie.findOne({ tmdb_id, isMovie });

        if (collectionsID.length === 0) {
            res.status(400).json({ message: "no collection selected" });
        }

        if (existingMovie) {
            const uniqueElements = collectionsID.filter(
                (element) => !existingMovie.collectionsID.includes(element)
            );

            existingMovie.collectionsID =
                existingMovie.collectionsID.concat(uniqueElements);
            const savedMovie = await existingMovie.save();

            if (savedMovie) {
                res.status(200).json(savedMovie);
                return;
            }
        } else {
            const newMovie = new Movie({
                name,
                tmdb_id,
                isMovie,
                backdrop_path,
                collectionsID,
            });

            const savedNewMovie = await newMovie.save();

            if (savedNewMovie) {
                res.status(200).json(savedNewMovie);
                return;
            }
        }
        res.status(500).json({ message: "the movie is not saved" });
    }),
];

//   "name":"Another movie 2",
// "isMovie":true,
// "tmdb_id":122344,
// "collectionID":"64df574e5717e5a099578e77"
// "poster_path" :"dfdfsdfsd"
const deleteMovieFromCollection = [
    body("name")
        // .matches(/^[a-zA-Z0-9:.,!?#$%()\s'\-.]+$/)
        .escape(),

    body("isMovie")
        .isBoolean()
        .withMessage("Your message if not boolean")
        .escape(),

    body("tmdb_id")
        .matches(/^[0-9]+$/)
        .withMessage("Input must contain only digits"),

    expressAsyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.log(errors);
            res.status(400).json({ message: "Invalid input" });
            return;
        }

        const { tmdb_id, isMovie } = req.body;
        const { deletedCollectionID } = req.body;

        if (deletedCollectionID === undefined) {
            res.status(400).json({ message: "Bad Request" });
            return;
        }

        const findMovie = await Movie.findOne({ tmdb_id, isMovie });

        // if the movie does not belong to any collection, delete it
        if (!findMovie) {
            res.status(400).json("Dont exist");
        }

        if (findMovie.collectionsID.includes(deletedCollectionID)) {
            findMovie.collectionsID = findMovie.collectionsID.filter(
                (item) => !item.equals(deletedCollectionID)
            );

            if (!findMovie.collectionsID.length) {
                await Movie.findByIdAndDelete(findMovie._id);
                res.status(200).json({ message: "Movie deleted" });
                return;
            }

            const savedMovie = await findMovie.save();
            res.status(200).json(savedMovie);
            return;
        }
        res.status(400).json({
            message: "the movie is not in this collection",
        });
    }),
];
// pagination
const searchMovieList = expressAsyncHandler(async (req, res, next) => {
    console.log("here");
    let { collectionID, page, movieName } = req.params;

    if (movieName === undefined) {
        movieName = "";
    }

    console.log(collectionID);
    console.log(page);
    console.log(movieName);
    const limit = 12;
    const skip = (page - 1) * limit;
    // ,
    const finedMoviesList = await Movie.find({
        collectionsID: { $in: [collectionID] },
        name: { $regex: `${movieName}`, $options: "i" },
    })
        .limit(limit)
        .skip(skip);
    const countMovies = await Movie.countDocuments({
        collectionsID: { $in: [collectionID] },
        name: { $regex: `${movieName}`, $options: "i" },
    });
    console.log(finedMoviesList);
    if (!finedMoviesList.length) {
        console.log(finedMoviesList.length);
        res.status(400).json("Movies not find");
        return;
    }
    res.status(200).json({ finedMoviesList, countMovies });
});

export default {
    addMovieToCollection,
    deleteMovieFromCollection,
    getCurrentMovie,

    searchMovieList,
};
