import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const collectionSchema = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  isPrivate: {
    type: Boolean,
    require: true,
  },
  movies: {
    type: [
      {
        name: {
          type: String,
          required: true,
          minLength: 1,
          maxLength: 100,
        },
        isMovie: {
          type: Boolean,
          required: true,
        },
        tmdb_id: {
          type: Number,
          required: true,
        },
        backdrop_path: {
          type: String,
          // required:true,
        },
      },
    ],
    validate: [arrayLimit, 'exceeds the limit of 10'],
  },
});

function arrayLimit(val) {
  return val.length <= 150;
}
const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
