import mongoose from 'mongoose'

const Schema = mongoose.Schema

const movieSchema = new Schema({
    name:{
        type:String,
        required:true,
        minLength:1,
        maxLength:100
    },
    isMovie:{
        type:Boolean,
        required:true,

    },
    tmdb_id:{
        type:Number,
        required:true,
    },
    backdrop_path:{
        type:String,
        // required:true,
    },
    collectionsID:[
        {
            type:Schema.Types.ObjectId,
            ref:'Collection',
           
        }
    ]
})

const Movie = mongoose.model('Movie',movieSchema)


export default Movie