import mongoose from 'mongoose'

const Schema = mongoose.Schema

const collectionSchema = new Schema({
    name:{
        type:String,
        required:true,
        minLength:1,
        maxLength:100
    },
    films:[
        {
            tmdb_id:{
                type:Number,
                required:true,
                unique:true
            },
            name:{
                type:String,
                required:true,
            },
            isMovie:{
                type:Boolean
            }
        }
    ],
    userID:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    private:{
        type:Boolean,
        require:true
    }
})

const Collection = mongoose.model('Collection', collectionSchema)

export default Collection