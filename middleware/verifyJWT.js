import jsonwebtoken from 'jsonwebtoken';
import User from '../models/User.js';
import expressAsyncHandler from 'express-async-handler';

const verifyJWT = (req, res, next) => {
  console.log('DFGFDGD');
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized ' });
  }

  const token = authHeader.split(' ')[1];

  jsonwebtoken.verify(
    token,
    process.env.ACCESS_TOKEN,
    expressAsyncHandler(async (err, decoded) => {
      if (err) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const verifyUser = await User.findById(decoded.UserInfo.userID);
      req.user = verifyUser._id;
      next();
    })
  );
};

export default verifyJWT;
