import expressAsyncHandler from "express-async-handler";
import {body, validationResult } from 'express-validator'
import Collection from "../models/Collection.js";
import Movie from "../models/Movie.js";


// get all current user collection
const getAllCurrentUserCollection = expressAsyncHandler(async(req,res,next)=>{

    const authorizeUserID = req.user._id 

    const allCurrentUserCollection = await Collection.find({userID:authorizeUserID}).exec();

    if(!allCurrentUserCollection.length){
        res.status(400).json('Collection not find')
        return;
    }

    res.status(200).json(allCurrentUserCollection)

})

// create new collection
const createNewCollection = [
    body('name')
        .escape(),
    body('private')
        .escape(),
    expressAsyncHandler(async(req, res, next)=>{

        // Authorize user
        const authorizeUserID = req.user._id;
    
        if(req.body.name === undefined  || req.body.private === undefined){

            res.status(400).json('Invalid data')
            return;
        }
       
        // create collection
        const newCollection = new Collection({
            userID:authorizeUserID,
            name: req.body.name,
            private: req.body.private
        })
       
        // save
        const collection = await newCollection.save()
        console.log(collection)
        res.status(200).json(collection)
    
    })
]

const getCurrentCollection = expressAsyncHandler(async(req,res, next)=>{
    const {collectionID} = req.params
    const authorizeUserID = req.user._id

    const currentCollection = await Collection.findById(collectionID).exec()
    const ownerCollection = currentCollection.userID

 
    if(currentCollection.private){

        if(ownerCollection.equals(authorizeUserID)){

            const allMovieCurrentCollection = await Movie.find({collectionsID:{$in:[collectionID]}})

            res.status(200).json({currentCollection,allMovieCurrentCollection})
            return;
        } else {
            res.status(401).json({message:"You cannot view this collection because it is private"})
            return;
        }

    } else {
        const allMovieCurrentCollection = await Movie.find({collectionsID:{$in:[collectionID]}})
        res.status(200).json({currentCollection,allMovieCurrentCollection})
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
        const authorizeUserID = req.user._id;
    
        const collection = await Collection.findById(collectionID);
        
    
        if (!collection) {
          return res.status(404).json({ message: 'Collection not found' });
        }
        
        const ownerCollection = collection.userID
        // Check user
        if (!ownerCollection.equals(authorizeUserID)) {
          return res.status(401).json({message:"You cannot update other people's collections"});
        }
    
        collection.name = req.body.name,
        collection.private = req.body.private
                
        const updatedCollection = await collection.save()
        res.status(200).json(updatedCollection)
               
    })
]


const deleteCollection = expressAsyncHandler(async(req,res,next)=>{

    console.log('DELETE')
    const collectionID = req.params.collectionID;
    const authorizeUserID = req.user._id;

    const collection = await Collection.findById(collectionID);

    console.log(collection)
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const ownerCollection = collection.userID
    if (!ownerCollection.equals(authorizeUserID)) {
      return res.status(401).json("You cannot update other people's collections");
    }
    
    // removing the collection link from each movie
    await Movie.updateMany({},{ $pull :{collectionsID:collectionID}});

    // remove those movies that do not have any links to collections
    await Movie.deleteMany({
        $expr: { $eq: [{ $size: '$collectionsID' }, 0] }
    });


    // delete collection
    await Collection.findByIdAndDelete(collectionID);

    const findCollection = await Collection.findById(collectionID).exec()

    if(!findCollection){

        res.status(200).json({message:"successfully deleted"})
        return;
    }
    res.status(500).json({message:"Error delete"})
})

export default {
    getAllCurrentUserCollection,
    createNewCollection,
    getCurrentCollection,
    updateCurrentCollection,
    deleteCollection,
}