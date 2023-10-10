import expressAsyncHandler from "express-async-handler";
import { body } from "express-validator";
import OpenAI from "openai";
import extractMovieTitle from "../lib/extractMovieTitle.js";
import sanitizeString from "../lib/sanitaizer.js";
import decodeHTML from "../lib/decodeString.js";
const findMovie = [
    body("description").trim().escape(),

    expressAsyncHandler(async (req, res, next) => {
        // here the data from the input is sent
        // req.body.description
        const description = req.body.description;
        const isMovie = JSON.parse(req.body.isMovie);

        if (!description && isMovie === undefined) {
            res.status(400).json("Empty input");
        }

        // if isMovie we search movie

        const openai = new OpenAI({
            apiKey: process.env.OPEN_AI_API_KEY,
        });

        const chatResponse = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Now I will give you a description of the ${
                        isMovie ? "movie" : " one series"
                    }, and you have to find the ${
                        isMovie ? "one movie" : "one series"
                    } according to the description. Answer with only one ${
                        isMovie ? "one movie" : "one series"
                    } title and only in English. Always write the name of the ${
                        isMovie ? "movie" : "oseries"
                    } in quotation marks.If instead of a description you receive the name of the ${
                        isMovie ? "one movie" : "one series"
                    }, then return a similar another ${
                        isMovie ? "one movie" : "one series"
                    } the user can indicate to you the genre or the country of production of the film and you must choose the film according to these parameters. if the request is in another language, you should always translate it into English.you should search for the movie in any language, but answer me only in English`,
                },
                {
                    role: "user",
                    content: `Here is the description of the ${
                        isMovie ? "movie" : " one series"
                    }:"${description}"Never give me film Battle for Sevastopol and The Tribe`,
                },
            ],
            model: "gpt-3.5-turbo-16k-0613",
            frequency_penalty: 1.5,
            temperature: 0.8,
            max_tokens: 50,
        });
        console.log(chatResponse);
        const nameMovie = sanitizeString(
            extractMovieTitle(chatResponse.choices[0].message.content)
        );
        console.log(chatResponse.choices[0].message.content);

        const nameParams = new URLSearchParams();
        nameParams.set("query", nameMovie);

        if (isMovie && description.length > 0) {
            // для того щоб вставити в API

            // поки ми просто шукаємо в базі даних
            // а потім підключим чат

            console.log(nameParams.toString());
            // extractMovieTitle

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
            const dataSeries = await fetch(
                `https://api.themoviedb.org/3/search/tv?api_key=${
                    process.env.TMDB_API_KEY
                }&${nameParams.toString()}&language=en-US&page=1`
            );
            const Series = await dataSeries.json();
            const id = Series.results[0].id;

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
