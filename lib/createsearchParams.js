import sanitizeString from './sanitazer.js';

function createSearchParams(chatAnswer) {
  const sanitizeMovieTitle = sanitizeString(chatAnswer.movie_title);
  const sanitizeOriginalTitle = sanitizeString(chatAnswer.original_title);

  const paramsOriginalTitle = new URLSearchParams();
  const paramsTitle = new URLSearchParams();

  paramsOriginalTitle.set('query', sanitizeOriginalTitle);
  paramsTitle.set('query', sanitizeMovieTitle);

  return { paramsOriginalTitle, paramsTitle };
}
export default createSearchParams;
