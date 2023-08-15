import expressAsyncHandler from "express-async-handler";
import {body, validationResult } from 'express-validator'
import Collection from "../models/Collection.js";
import User from '../models/User.js'

// get all current user collection
const getAllCurrentUserCollection = expressAsyncHandler(async(req,res,next)=>{

    const {userID} = req.user._id 

    const allUserCollection = await Collection.find({userID}).exec();

    if(!allUserCollection.length){
        res.status(400).json('Collection not find')
        return;
    }

    res.status(200).json(allUserCollection)

})

// add new collection
const addNewCollection = [
    body('name')
        .escape(),
    body('films')
        .escape(),
    body('private')
        .escape(),
    expressAsyncHandler(async(req, res, next)=>{

        // Authorize user
        const userID = req.user._id;
    
        if(!req.body.name || !req.body.films || !req.body.private){
            res.status(400).json('Invalid data')
            return;
        }
        
        // create collection
        const newCollection = new Collection({
            name: req.body.name,
            userID,
            films: req.body.films,
            private: req.body.private
        })
        
        // save
        const collection = await newCollection.save()
        res.status(200).json(collection)
    
    })
]

const getCurrentCollection = expressAsyncHandler(async(req,res, next)=>{
    const {collectionID} = req.params
    const userID = req.user._id

    const currentCollection = await Collection.findById(collectionID).exec()
    const userCollection = await User.findById(currentCollection.userID)

 
    if(currentCollection.private){

        if(userCollection._id.equals(userID)){

            res.status(200).json(currentCollection)
            return;
        } else {
            res.status(401).json('You cannot view this collection because it is private')
            return;
        }

    } else {
        res.status(200).json(currentCollection)
        return;
    }
})

// Update current collection
const updateCurrentCollection = [
    body('name')
        .isAlphanumeric()
        .escape(),

    body('private')
        .isBoolean()
        .withMessage('Your message if not boolean')
        .escape(),

    expressAsyncHandler(async(req,res,next)=>{

        const errors = validationResult(req);

        if(!errors.isEmpty()){
            
            res.status(400).json({ message: 'Invalid input' });
            return;
        }

        // get action 
        const collectionID = req.params.collectionID;
        const userID = req.user._id;
    
        const collection = await Collection.findById(collectionID);
    
        if (!collection) {
          return res.status(404).json({ message: 'Collection not found' });
        }
        
        // Check user
        if (!collection.userID.equals(userID)) {
          return res.status(401).json("You cannot update other people's collections");
        }
    
        collection.name = req.body.name,
        collection.private = req.body.private
                
        const updatedCollection = await collection.save()
        res.status(200).json(updatedCollection)
               
    })
]

const addMovieToCollection = [
    body('name')
        .isAlphanumeric()
        .escape(),

    body('isMovie')
        .isBoolean()
        .withMessage('Your message if not boolean')
        .escape(), 

    body('tmdb_id')
        .matches(/^[0-9]+$/)
        .withMessage('Input must contain only digits'),

    expressAsyncHandler(async(req,res, next)=>{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            
            res.status(400).json({ message: "Invalid input" });
            return;
        }

        const collectionID = req.params.collectionID;
        const userID = req.user._id;

        const tmdb_id = parseInt(req.body.tmdb_id);
        const isMovie = JSON.parse(req.body.isMovie);
        const collection = await Collection.findById(collectionID);

        if (!collection.userID.equals(userID)) {
            return res.status(401).json("You cannot update other people's collections");
        }

        const films = collection.films;
    
        // checking if such a movie already exists
        const existingMovie = films.find((item)=>{
            return ((item.tmdb_id ===  tmdb_id) && (item.isMovie === isMovie))
        })
        
      
        // if such a movie already exists, do not add it
        if(existingMovie){
            res.status(400).json({message:"This movie is already in the collection"})
            return;
        } 
    
        collection.films = collection.films.concat(req.body);
        const updatedCollection = await collection.save()
    
        if(!updatedCollection){
            res.status(400).json({message:"Error"})
            return;
        }
        res.status(200).json(updatedCollection)
    })
]

const deleteMovieFromCollection = [
    body("name")
        .isAlphanumeric()
        .escape(),

    body("isMovie")
        .isBoolean()
        .withMessage("Your message if not boolean")
        .escape(), 

    body("tmdb_id")
        .matches(/^[0-9]+$/)
        .withMessage("Input must contain only digits"),

    expressAsyncHandler(async(req,res,next)=>{

        const errors = validationResult(req);

        if(!errors.isEmpty()){
            
            res.status(400).json({ message: "Invalid input" });
            return;
        }
        
        const collectionID = req.params.collectionID;
        const userID = req.user._id;

        const tmdb_id = parseInt(req.body.tmdb_id);
        const isMovie = JSON.parse(req.body.isMovie);
        const collection = await Collection.findById(collectionID);

        if (!collection.userID.equals(userID)) {
            return res.status(401).json({message:"You cannot update other people's collections"});
        }
    
        const films = collection.films;
    
        // checking if such a movie already exists
        const existingMovie = films.find((item)=>{
            return ((item.tmdb_id ===  tmdb_id) && (item.isMovie === isMovie))
        })
        
        // if such a movie already exists, do not add it
        if(!existingMovie){
            res.status(400).json({message:"No such movie found"})
            return;
        } 
    
        collection.films = collection.films.filter((item)=>{
            return !((item.tmdb_id === tmdb_id) && (item.isMovie === isMovie ))
        })

        const updatedCollection = await collection.save()
        res.status(200).json(updatedCollection)
    })
]
const deleteCollection = expressAsyncHandler(async(req,res,next)=>{

    const collectionID = req.params.collectionID;
    const userID = req.user._id;

    const collection = await Collection.findById(collectionID);



    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (!collection.userID.equals(userID)) {
      return res.status(401).json("You cannot update other people's collections");
    }
    // const collectionId = req.body.

    // await Collection.findByIdAndDelete(collectionId)
    // res.status(200).json('Collection was deleted')
})

export default {
    getAllCurrentUserCollection,
    addNewCollection,
    getCurrentCollection,
    updateCurrentCollection,
    deleteCollection,
    addMovieToCollection,
    deleteMovieFromCollection
}