import expressAsyncHandler from 'express-async-handler'
import { body, validationResult } from 'express-validator'
import fetch from 'node-fetch';

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


export default {
    findMovie
}