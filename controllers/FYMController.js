import expressAsyncHandler from "express-async-handler";
import { body } from "express-validator";

const findMovie = [
    body("description").trim().escape(),

    expressAsyncHandler(async (req, res, next) => {
        // here the data from the input is sent
        // req.body.description
        const description = req.body.description;
        console.log(description);
        const isMovie = JSON.parse(req.body.isMovie);

        if (!description && isMovie === undefined) {
            res.status(400).json("Empty input");
        }

        // if isMovie we search movie
        console.log(description.length);
        if (isMovie && description.length > 0) {
            const nameParams = new URLSearchParams();
            // поки ми просто шукаємо в базі даних
            // а потім підключим чат
            nameParams.set("query", description);

            console.log("here");

            const dataMovie = await fetch(
                `https://api.themoviedb.org/3/search/movie?api_key=${
                    process.env.TMDB_API_KEY
                }&${nameParams.toString()}&language=en-US&page=1`
            );
            // const dataMovie = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=dexter&language=en-US&page=1`)
            const film = await dataMovie.json();
            const id = film.results[0].id;
            // console.log(film.results[0])

            // get movie details
            const filmDetails = await fetch(
                `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`
            );
            const data = await filmDetails.json();

            res.status(200).json(data);

            // else search tv
        } else if (description.length > 0) {
            const nameParams = new URLSearchParams();
            // поки ми просто шукаємо в базі даних
            // а потім підключим чат
            nameParams.set("query", description);
            console.log("here2");
            const dataMovie = await fetch(
                `https://api.themoviedb.org/3/search/tv?api_key=${
                    process.env.TMDB_API_KEY
                }&${nameParams.toString()}&language=en-US&page=1`
            );
            const film = await dataMovie.json();
            const id = film.results[0].id;

            // get movie details
            const filmDetails = await fetch(
                `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.TMDB_API_KEY}`
            );
            const data = await filmDetails.json();

            res.status(200).json(data);
        }
    }),
];

export default {
    findMovie,
};
