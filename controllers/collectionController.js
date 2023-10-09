import expressAsyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import Collection from "../models/Collection.js";
import Movie from "../models/Movie.js";

// get all current user collection
const getAllCurrentUserCollection = expressAsyncHandler(
    async (req, res, next) => {
        const authorizeUserID = req.user._id;

        const allCurrentUserCollection = await Collection.find({
            userID: authorizeUserID,
        }).exec();

        if (!allCurrentUserCollection.length) {
            res.status(400).json("Collection not find");
            return;
        }

        res.status(200).json(allCurrentUserCollection);
    }
);

// create new collection
const createNewCollection = [
    body("name").escape(),
    body("isPrivate").escape(),
    expressAsyncHandler(async (req, res, next) => {
        // Authorize user
        const authorizeUserID = req.user._id;

        if (req.body.name === undefined || req.body.isPrivate === undefined) {
            res.status(400).json("Invalid data");
            return;
        }

        // create collection
        const newCollection = new Collection({
            userID: authorizeUserID,
            name: req.body.name,
            isPrivate: req.body.isPrivate,
        });

        // save
        const collection = await newCollection.save();
        console.log(collection);
        res.status(200).json(collection);
    }),
];
// const getCurrentCollectionWithMovie = expressAsyncHandler()

// pagination
const getCurrentCollection = expressAsyncHandler(async (req, res, next) => {
    console.log("CURRENT");
    let { collectionID, page, movieName } = req.params;

    if (movieName === undefined) {
        movieName = "";
    }

    const limit = 12;
    const skip = (page - 1) * limit;
    const authorizeUserID = req.user._id;
    let countPage;
    const currentCollection = await Collection.findById(collectionID).exec();
    const ownerCollection = currentCollection.userID;

    if (currentCollection.isPrivate) {
        if (ownerCollection.equals(authorizeUserID)) {
            const countMovies = await Movie.countDocuments({
                collectionsID: { $in: [collectionID] },
                name: { $regex: `${movieName}`, $options: "i" },
            });
            countPage = Math.ceil(countMovies / 12);

            if ((Number(page) !== 1) & (page > countPage)) {
                res.status(400).json("This page does not exist");
                return;
            }

            const finedMoviesList = await Movie.find({
                collectionsID: { $in: [collectionID] },
                name: { $regex: `${movieName}`, $options: "i" },
            })
                .limit(limit)
                .skip(skip);

            if (!finedMoviesList.length) {
                console.log("sdf");
                // console.log(finedMoviesList.length)
                res.status(200).json({ currentCollection });
                return;
            }

            res.status(200).json({
                currentCollection,
                finedMoviesList,
                countPage,
            });
            return;
        } else {
            res.status(401).json({
                message:
                    "You cannot view this collection because it is Private",
            });
            return;
        }
    } else {
        const countMovies = await Movie.countDocuments({
            collectionsID: { $in: [collectionID] },
            name: { $regex: `${movieName}`, $options: "i" },
        });
        countPage = Math.ceil(countMovies / 12);

        if ((Number(page) !== 1) & (page > countPage)) {
            console.log("6 if");
            res.status(400).json("This page does not exist");
            return;
        }

        const finedMoviesList = await Movie.find({
            collectionsID: { $in: [collectionID] },
            name: { $regex: `${movieName}`, $options: "i" },
        })
            .limit(limit)
            .skip(skip);

        if (!finedMoviesList.length) {
            // console.log(finedMoviesList.length)
            res.status(200).json({ currentCollection });
            return;
        }
        res.status(200).json({
            currentCollection,
            finedMoviesList,
            countPage,
        });
        // res.status(200).json({currentCollection,allMovieCurrentCollection})
        return;
    }
});

// Update current collection
const updateCurrentCollection = [
    body("name")
        // .isAlphanumeric()
        .escape(),

    body("isPrivate")
        .isBoolean()
        .withMessage("Your message if not boolean")
        .escape(),

    expressAsyncHandler(async (req, res, next) => {
        console.log("COLLECTION");
        console.log(req.body);
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.log(errors.array());
            res.status(400).json({ message: "Invalid input" });
            return;
        }

        // get action
        const { collectionID } = req.params;
        const authorizeUserID = req.user._id;

        console.log(req.params);

        const collection = await Collection.findById(collectionID);

        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }

        const ownerCollection = collection.userID;
        // Check user
        if (!ownerCollection.equals(authorizeUserID)) {
            return res.status(401).json({
                message: "You cannot update other people's collections",
            });
        }

        (collection.name = req.body.name),
            (collection.isPrivate = req.body.isPrivate);

        const updatedCollection = await collection.save();
        res.status(200).json(updatedCollection);
    }),
];

const deleteCollection = expressAsyncHandler(async (req, res, next) => {
    console.log("DELETE");
    const collectionID = req.params.collectionID;
    const authorizeUserID = req.user._id;

    const collection = await Collection.findById(collectionID).lean().exec();

    console.log(collection);
    if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
    }

    const ownerCollection = collection.userID;
    if (!ownerCollection.equals(authorizeUserID)) {
        return res
            .status(401)
            .json("You cannot update other people's collections");
    }

    // removing the collection link from each movie
    await Movie.updateMany(
        { collectionsID: collectionID },
        { $pull: { collectionsID: collectionID } }
    );

    // remove those movies that do not have any links to collections
    await Movie.deleteMany({
        $expr: { $eq: [{ $size: "$collectionsID" }, 0] },
    })
        .lean()
        .exec();

    // delete collection
    await Collection.deleteOne({ _id: collectionID }).lean().exec();

    const findCollection = await Collection.findById(collectionID).exec();

    if (!findCollection) {
        res.status(200).json({ message: "successfully deleted" });
        return;
    }
    res.status(500).json({ message: "Error delete" });
});

const getRandomCollections = expressAsyncHandler(async (req, res, next) => {
    console.log("RANDOM");
    console.log(req.user._id);
    const result = await Collection.aggregate([
        {
            $match: {
                isPrivate: false,

                userID: { $ne: req.user._id },
            },
        },
        { $sample: { size: 20 } },
    ]);
    //
    if (result) return res.status(200).json(result);
    res.status(500).json("d");
});

// const getCurrentUserCollectionPagination = expressAsyncHandler(
//     async (req, res, next) => {
//         const { page } = req.params;
//         const limit = 12;
//         const skip = (page - 1) * limit;

//         const authorizeUserID = req.user._id;

//         const collectionResult = await Collection.find({
//             userID: authorizeUserID,
//         })
//             .limit(limit)
//             .skip(skip);
//         const countCurrentDocument = await Collection.countDocuments({
//             userID: authorizeUserID,
//         });

//         if (!collectionResult.length) {
//             res.status(400).json("Collection not find");
//             return;
//         }
//         res.status(200).json({ collectionResult, countCurrentDocument });
//     }
// );

const searchCurrentUserCollectionPagination = expressAsyncHandler(
    async (req, res, next) => {
        let { page, inputValue } = req.params;
        console.log(inputValue);
        if (inputValue === undefined) {
            inputValue = "";
        }
        // console.log(req.path)
        const limit = 12;
        const skip = (page - 1) * limit;
        let countPage;
        console.log(page);
        const authorizeUserID = req.user._id;

        const countFindCurrentDocument = await Collection.countDocuments({
            userID: authorizeUserID,
            name: { $regex: `${inputValue}`, $options: "i" },
        });

        countPage = Math.ceil(countFindCurrentDocument / 12);

        if ((Number(page) !== 1) & (page > countPage)) {
            res.status(400).json("This page does not exist");
            return;
        }

        const findCollectionResult = await Collection.find({
            userID: authorizeUserID,
            name: { $regex: `${inputValue}`, $options: "i" },
        })
            .limit(limit)
            .skip(skip);

        if (!findCollectionResult.length) {
            console.log(findCollectionResult.length);
            res.status(400).json("Collection not find");
            return;
        }
        res.status(200).json({
            findCollectionResult,
            countPage,
        });
    }
);

const searchRandomCollectionPagination = expressAsyncHandler(
    async (req, res, next) => {
        let { page, inputValue } = req.params;

        if (inputValue === undefined) {
            inputValue = "";
        }
        // console.log(req.path)
        const limit = 12;
        const skip = (page - 1) * limit;
        const authorizeUserID = req.user._id;
        let countPage = 0;

        const countFindCurrentDocument = await Collection.countDocuments({
            userID: { $ne: authorizeUserID },
            name: { $regex: `${inputValue}`, $options: "i" },
            isPrivate: false,
        });

        countPage = Math.ceil(countFindCurrentDocument / 12);

        if ((Number(page) !== 1) & (page > countPage)) {
            res.status(400).json("This page does not exist");
            return;
        }

        const findRandomCollectionResult = await Collection.find({
            userID: { $ne: authorizeUserID },
            name: { $regex: `${inputValue}`, $options: "i" },
            isPrivate: false,
        })
            .limit(limit)
            .skip(skip);

        if (!findRandomCollectionResult.length) {
            console.log(findRandomCollectionResult.length);
            res.status(400).json("Collection not find");
            return;
        }
        res.status(200).json({
            findRandomCollectionResult,
            countPage,
        });
    }
);

export default {
    getAllCurrentUserCollection,
    createNewCollection,
    getCurrentCollection,
    updateCurrentCollection,
    deleteCollection,
    getRandomCollections,

    // getCurrentUserCollectionPagination,
    searchCurrentUserCollectionPagination,
    searchRandomCollectionPagination,
};
