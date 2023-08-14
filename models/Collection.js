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
            id:{
                type:String,
                required:true,
                unique:true
            },
            name:{
                type:String,
                required:true,
            }
        }
    ],
    userID:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
})

const Collection = mongoose.model('Collection', collectionSchema)

export default Collection