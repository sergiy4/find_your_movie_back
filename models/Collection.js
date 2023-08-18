import mongoose from 'mongoose'

const Schema = mongoose.Schema

const collectionSchema = new Schema({
    userID:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    name:{
        type:String,
        required:true,
        minLength:1,
        maxLength:100
    },
    private:{
        type:Boolean,
        require:true
    }
})

const Collection = mongoose.model('Collection', collectionSchema)

export default Collection