import expressAsyncHandler from 'express-async-handler';
import { body } from 'express-validator';
import OpenAI from 'openai';
import getChatAnswer from '../lib/getChatAnswer.js';
import createSearchParams from '../lib/createsearchParams.js';
import searchMovieOrSeries from '../lib/searchMovieOrSeries.js';
import getMovieOrSeriesDetails from '../lib/getMovieOrSeriesDetails.js';

const findMovie = [
  body('description').trim().escape(),

  expressAsyncHandler(async (req, res, next) => {
    // here the data from the input is sent
    const description = req.body.description;

    if (!description) {
      return res.status(400).json({ message: 'Empty input' });
    }

    // chat config
    const openai = new OpenAI({
      apiKey: process.env.OPEN_AI_API_KEY,
    });

    const chatAnswer = await getChatAnswer(description, openai);
    console.log(chatAnswer);
    if (chatAnswer?.isMovie === undefined) {
      return res.status(400).json({
        message: 'Sorry, movie not found. Please try again.',
      });
    }

    const searchParams = createSearchParams(chatAnswer);
    const searchType = chatAnswer.isMovie ? 'movie' : 'tv';

    const searchResult = await searchMovieOrSeries(searchParams, searchType);

    if (!searchResult || searchResult.results.length === 0) {
      return res.status(400).json({
        message: 'Sorry, movie or series not found. Please try again.',
      });
    }

    const id = searchResult.results[0]?.id;
    if (!id) {
      return res.status(400).json({
        message: 'Sorry, movie or series not found. Please try again.',
      });
    }

    const details = await getMovieOrSeriesDetails(id, searchType);

    const filmDetails = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`
    );

    res.status(200).json(details);
  }),
];

export default {
  findMovie,
};
