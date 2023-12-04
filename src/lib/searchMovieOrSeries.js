async function searchMovieOrSeries(params, type) {
  console.log('searchMovieOrSeries');
  let result;

  if (params.paramsOriginalTitle) {
    console.log('params.paramsOriginalTitle');
    let searchResult = await fetch(
      `https://api.themoviedb.org/3/search/${type}?api_key=${
        process.env.TMDB_API_KEY
      }&${params.paramsOriginalTitle.toString()}&page=1`
    );

    result = await searchResult.json();
    console.log(result);
  }

  console.log(result?.results?.length);
  if (result?.results?.length === 0) {
    console.log('result?.results?.length === 0');
    let searchResult = await fetch(
      `https://api.themoviedb.org/3/search/${type}?api_key=${
        process.env.TMDB_API_KEY
      }&${params.paramsTitle.toString()}&page=1&`
    );
    result = await searchResult.json();
    console.log(result);
  }

  return result;
}

export default searchMovieOrSeries;
