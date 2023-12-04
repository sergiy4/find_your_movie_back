async function getMovieOrSeriesDetails(id, type) {
  console.log('getMovieOrSeriesDetails');
  const data = await fetch(
    `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API_KEY}`
  );
  let result = await data.json();
  return result;
}

export default getMovieOrSeriesDetails;
