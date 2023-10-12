import expressAsyncHandler from "express-async-handler";
import { body } from "express-validator";
import OpenAI from "openai";
import extractMovieTitle from "../lib/extractMovieTitle.js";
import sanitizeString from "../lib/sanitaizer.js";
import { json } from "express";
import getChatConfig from "../config/chatConfig.js";

const findMovie = [
    body("description").trim().escape(),

    expressAsyncHandler(async (req, res, next) => {
        // here the data from the input is sent

        const description = req.body.description;

        if (!description) {
            res.status(400).json("Empty input");
        }

        // chat config
        const openai = new OpenAI({
            apiKey: process.env.OPEN_AI_API_KEY,
        });

        const chatResponse = await openai.chat.completions.create(
            getChatConfig(description)
        );

        console.log(chatResponse.choices[0].message.content);
        const chatAnswer = JSON.parse(chatResponse.choices[0].message.content);

        const sanitizeMovieTitle = sanitizeString(chatAnswer.movie_title);
        const sanitizeOriginalTitle = sanitizeString(chatAnswer.original_title);

        // format in order to insert into the url
        const originalNameParams = new URLSearchParams();
        originalNameParams.set("query", sanitizeOriginalTitle);

        const movieTitleParams = new URLSearchParams();
        movieTitleParams.set("query", sanitizeMovieTitle);

        if (chatAnswer?.isMovie === undefined) {
            res.status(400).json({
                message: "Sorry , movie not found :( \n Pleas try again",
            });
            return;
        }

        if (chatAnswer?.isMovie) {
            console.log(chatAnswer?.release_year);
            let dataMovie = await fetch(
                `https://api.themoviedb.org/3/search/movie?api_key=${
                    process.env.TMDB_API_KEY
                }&${originalNameParams.toString()}&page=1&primary_release_year=${String(
                    chatAnswer?.release_year
                )}&region=${chatAnswer?.region}`
            );

            console.log(originalNameParams);
            // get movie id
            let film = await dataMovie.json();

            // if the film is not found by the original title, search by English
            if (film.results.length === 0) {
                console.log("here");
                dataMovie = await fetch(
                    `https://api.themoviedb.org/3/search/movie?api_key=${
                        process.env.TMDB_API_KEY
                    }&${movieTitleParams.toString()}&page=1&primary_release_year=${String(
                        chatAnswer?.release_year
                    )}&region=${chatAnswer?.region}`
                );

                film = await dataMovie.json();
            }

            // git movie id
            const id = film?.results?.[0]?.id;

            if (!id) {
                res.status(400).json({
                    message: "Sorry , movie not found :( \n Pleas try again.",
                });
                return;
            }

            // get movie details
            const filmDetails = await fetch(
                `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`
            );
            const data = await filmDetails.json();

            res.status(200).json(data);
        } else {
            // else search tv
            let dataSeries = await fetch(
                `https://api.themoviedb.org/3/search/tv?api_key=${
                    process.env.TMDB_API_KEY
                }&${originalNameParams.toString()}&page=1`
            );
            let Series = await dataSeries.json();

            if (Series.results.length === 0) {
                dataSeries = await fetch(
                    `https://api.themoviedb.org/3/search/tv?api_key=${
                        process.env.TMDB_API_KEY
                    }&${movieTitleParams.toString()}&page=1`
                );
                Series = await dataSeries.json();
            }

            const id = Series.results[0]?.id;

            if (!id) {
                console.log("here");
                res.status(400).json({
                    message: `Sorry , serials not found :(`,
                });
                return;
            }

            // get movie details
            const SeriesDetails = await fetch(
                `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.TMDB_API_KEY}`
            );
            const data = await SeriesDetails.json();

            res.status(200).json(data);
        }
    }),
];

export default {
    findMovie,
};
