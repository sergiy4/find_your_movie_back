export default function errorHandler(err, req, res, next) {
  console.log(err.message);
  // set locals, only providing error in development
  res.locals.message = err.message;

  res
    .status(err.status || 500)
    .json({ message: err.message | 'Sorry something went wrong' });
}
