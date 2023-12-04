import mongoose from 'mongoose'
const Schema = mongoose.Schema

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        minLength:3,
        maxLength:40,
        unique:true
    },
    hash:{
        type:String,
        required:true
    }
})

const User = mongoose.model('User', userSchema)

export default User