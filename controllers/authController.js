import { genPasswordHash,  validPassword } from '../lib/untils.js'
import User from '../models/User.js'
import expressAsyncHandler from 'express-async-handler'
import { body, validationResult } from 'express-validator'
import jsonwebtoken from 'jsonwebtoken'
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
        const hash = await genPasswordHash(req.body.password)

        // create user
        const user = new User({
            username:req.body.username,
            hash
        })

        const savedUser = await user.save();
        res.status(201).json(savedUser)
        
    })
]

const login = [
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

    expressAsyncHandler(async(req, res, next)=>{
        // get errors
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            // if there are errors, I send them to the client
            res.status(400).json({message:'Bad request .Invalid input' })
        } 

        const user = await User.findOne({username: req.body.username}).exec()
        if(!user){
            res.status(401).json({success:false, msg:'could not find user'})
        }

        const isValid = await validPassword(req.body.password, user.hash)
        if(!isValid){
           res.status(401).json({success:false, msg:'could not find user'})

        } 

        const accessToken = jsonwebtoken.sign(
            {
                sub: user._id
            },
            process.env.ACCESS_TOKEN,
            { expiresIn:'20s' }
        )
        
        const refreshToken = jsonwebtoken.sign(
            {
                sub: user._id
            },
            process.env.REFRESH_TOKEN,
            { expiresIn:'1d' }
        )

        res.cookie('jwt', refreshToken, {
            httpOnly:true,
            secure:true,
            sameSite:'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.json({accessToken})
    })
]

const refresh = expressAsyncHandler(async(req, res, next)=>{
    const cookies = req.cookies

    console.log(cookies)
    console.log(req.cookies.jwt)
    if(!cookies?.jwt){
        return res.status(401).json({message:'Unauthorized'})
    }

    const refreshToken = cookies.jwt

    jsonwebtoken.verify(
        refreshToken,
        process.env.REFRESH_TOKEN,
        async(err, decoded) =>{
            if(err){
                res.status(403).json({message:'Forbidden'})
                return;
            }
            const foundUser = await User.findById(decoded.sub)

            if(!foundUser){
                res.status(401).json({message:'Unauthorize'})
                return;
            }

            const accessToken = jsonwebtoken.sign(
                {
                    sub: foundUser._id
                },
                process.env.ACCESS_TOKEN,
                { expiresIn:'10s' }
            )

            res.json({accessToken})
        }
    
    )
})

const logOut = (req, res, next)=>{
    const cookies = req.cookies
    if(!cookies?.jwt){
        return res.sendStatus(204)
    }
    res.clearCookie('jwt', {httpOnly:true,
        secure:true,
        sameSite:'none',})
    res.json({message:'Cookie cleared'})

}

// const logIn = [
//       // validation username
//       body('username','invalid name')
//       .trim()
//       .isLength({min:3, max:40})
//       .escape(),

//     // validation password
//     body('password','invalidPassword')
//       .trim()
//       .isLength({min:3, max:40})
//       .escape()
//       .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),

//     expressAsyncHandler(async(req,res,next)=>{
//         // get errors
//         const errors = validationResult(req);

//         if(!errors.isEmpty()){
//             // if there are errors, I send them to the client
//             res.status(400).json(`Bad request .Invalid input` )
//         } 

//         const user = await User.findOne({username: req.body.username}).exec()
//         if(!user){
//             res.status(401).json({success:false, msg:'could not find user'})
//         }

//         const isValid = await validPassword(req.body.password, user.hash)
//         if(isValid){

//            const tokenObject = issueJWT(user)

//            res.status(200).json({success:true, token:tokenObject.token, expires: tokenObject.expires})

//         } else {
//             res.status(401).json({success:false, msg:'could not find user'})
//         }
        
        
//     })
// ]

export default {
    register,
    login,
    refresh,
    logOut
}