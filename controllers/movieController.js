import expressAsyncHandler from 'express-async-handler'
import { body, validationResult } from 'express-validator'
import fetch from 'node-fetch';
import Collection from "../models/Collection.js";
import User from '../models/User.js'
import Movie from "../models/Movie.js";

const findMovie = [
    body('description').escape(),
    expressAsyncHandler(async(req,res,next)=>{

        // here the data from the input is sent
        // req.body.description
        const description = req.body.description
        const isMovie =JSON.parse( req.body.isMovie);

        if(!description && isMovie === undefined){

            res.status(400).json('Empty input')
        }
       
        // if isMovie we search movie
        if(isMovie){
            console.log('here')
            const dataMovie = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=dexter&language=en-US&page=1`)
            const film = await dataMovie.json()
            const id = film.results[0].id
    
    
            // get movie details
            const filmDetails = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`)
            const data = await filmDetails.json();

            res.status(200).json(data)

            // else search tv
        } else {
            console.log('here2')
            const dataMovie = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${process.env.TMDB_API_KEY}&query=dexter&language=en-US&page=1`)
            const film = await dataMovie.json()
            const id = film.results[0].id
    
    
            // get movie details
            const filmDetails = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.TMDB_API_KEY}`)
            const data = await filmDetails.json();

            res.status(200).json(data)
        }
    })
]

// "name":"dickssdfs Movie",
// "isMovie":true,
// "tmdb_id":1221,
// "collectionsID":["64db438045fb5f4d04c19654"]
const addMovieToCollection = [
    body('name')
        .matches(/^[a-zA-Z0-9 :.,!?#$%]+$/) 
        .customSanitizer(value=>value.toLowerCase())
        .escape(),

    body('isMovie')
        .isBoolean()
        .withMessage('Your message if not boolean')
        .escape(), 

    body('tmdb_id')
        .matches(/^[0-9]+$/)
        .withMessage('Input must contain only digits'),

    expressAsyncHandler(async(req,res, next)=>{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            console.log(errors)
            res.status(400).json({ message: "Invalid input" });
            return;
        }

        // an array of ids of collections that have not yet been added
        const { name, tmdb_id, isMovie, collectionsID } = req.body;
        // const authorizeUserID = req.user._id;

        // let's check if our movie exists
        const existingMovie = await Movie.findOne({ tmdb_id ,isMovie })

        if(existingMovie){

            const uniqueElements = collectionsID.filter(element => !existingMovie.collectionsID.includes(element))

            existingMovie.collectionsID = existingMovie.collectionsID.concat(uniqueElements);
            const savedMovie = await existingMovie.save()

            if(savedMovie){
                res.status(200).json(savedMovie)
                return;
            }

           
        } else {

            const newMovie = new Movie({
                name,
                tmdb_id,
                isMovie,
                collectionsID
            })

            const savedNewMovie = await newMovie.save()

            if(savedNewMovie){
                res.status(200).json(savedNewMovie)
                return;
            }

        }
        res.status(500).json({message:'the movie is not saved'})

    })
]


//   "name":"Another movie 2",
// "isMovie":true,
// "tmdb_id":122344,
// "collectionID":"64df574e5717e5a099578e77"
const deleteMovieFromCollection = [
    body('name')
        .matches(/^[a-zA-Z0-9 :.,!?#$%]+$/) 
        .escape(),

    body("isMovie")
        .isBoolean()
        .withMessage("Your message if not boolean")
        .escape(), 

    body("tmdb_id")
        .matches(/^[0-9]+$/)
        .withMessage("Input must contain only digits"),

    expressAsyncHandler(async(req,res,next)=>{

        const errors = validationResult(req);

        if(!errors.isEmpty()){
            
            res.status(400).json({ message: "Invalid input" });
            return;
        }
        
        const { tmdb_id, isMovie,  collectionID } = req.body;
        

        await Movie.updateOne({ tmdb_id,isMovie },{ $pull :{collectionsID:collectionID}});
        const updatedMovie = await Movie.findOne({tmdb_id, isMovie}).exec()

        // if the movie does not belong to any collection, delete it
        if(!updatedMovie.collectionsID.length){
            await Movie.findByIdAndDelete(updatedMovie._id)
        } 
        res.status(200).json({message:'successfully deleted'})
    })
]

export default {
    findMovie,
    addMovieToCollection,
    deleteMovieFromCollection
}