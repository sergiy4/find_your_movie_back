import { genPasswordHash, issueJWT, validPassword } from '../lib/untils.js'
import User from '../models/User.js'
import expressAsyncHandler from 'express-async-handler'
import { body, validationResult } from 'express-validator'

// 
const register = [
    // validation username
    body('username','invalid name')
        .trim()
        .isLength({min:3, max:40})
        .escape(),

    // validation password
    body('password','invalidPassword')
        .trim()
        .isLength({min:3, max:40})
        .escape()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
    
    expressAsyncHandler(async (req, res, next)=>{

        // get errors
        const errors = validationResult(req);


        if(!errors.isEmpty()){

            // if there are errors, I send them to the client
            res.status(400).json(`Bad request .Invalid input` )

        } 
        // If there are no errors, we save the user and send it to the client
        const checkDuplicate = await User.findOne({username: req.body.username}).exec()

        if(checkDuplicate){
            res.status(400).json('This username already exist')
        }

        // create hash
        const hash =await genPasswordHash(req.body.password)

        // create user
        const user = new User({
            username:req.body.username,
            hash
        })

        const savedUser = await user.save();
        res.status(201).json(savedUser)
        
    })
]

const logIn = [
      // validation username
      body('username','invalid name')
      .trim()
      .isLength({min:3, max:40})
      .escape(),

    // validation password
    body('password','invalidPassword')
      .trim()
      .isLength({min:3, max:40})
      .escape()
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),

    expressAsyncHandler(async(req,res,next)=>{
        // get errors
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            // if there are errors, I send them to the client
            res.status(400).json(`Bad request .Invalid input` )
        } 

        const user = await User.findOne({username: req.body.username}).exec()
        if(!user){
            res.status(401).json({success:false, msg:'could not find user'})
        }

        const isValid = await validPassword(req.body.password, user.hash)
        if(isValid){

           const tokenObject = issueJWT(user)

           res.status(200).json({success:true, token:tokenObject.token, expires: tokenObject.expires})

        } else {
            res.status(401).json({success:false, msg:'could not find user'})
        }
        
        
    })
]

export default {
    register,
    logIn
}