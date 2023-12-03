import { genPasswordHash, validPassword } from '../lib/untils.js';
import User from '../models/User.js';
import expressAsyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import jsonwebtoken from 'jsonwebtoken';
//
const register = [
  // validation username
  body('username', 'invalid name')
    .trim()
    .isLength({ min: 3, max: 40 })
    .escape(),

  // validation password
  body('password', 'invalid Password')
    .trim()
    .isLength({ min: 3, max: 40 })
    .escape()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/),

  expressAsyncHandler(async (req, res, next) => {
    // get errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      // if there are errors, I send them to the client
      const errorStr = errors
        .array()
        .map((item) => item.msg)
        .join(' . ');

      console.log(errorStr);
      res.status(400).json({ message: `${errorStr}` });
      return;
    }
    // If there are no errors, we save the user and send it to the client
    const checkDuplicate = await User.findOne({
      username: req.body.username,
    }).exec();

    if (checkDuplicate) {
      res.status(400).json({ message: 'This username already exist' });
      return;
    }

    // create hash
    const hash = await genPasswordHash(req.body.password);

    // create user
    const user = new User({
      username: req.body.username,
      hash,
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  }),
];

const login = [
  // validation username
  body('username', 'invalid name')
    .trim()
    .isLength({ min: 3, max: 40 })
    .escape(),

  // validation password
  body('password', 'Invalid password')
    .trim()
    .isLength({ min: 3, max: 40 })
    .escape()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    ),

  expressAsyncHandler(async (req, res, next) => {
    console.log(req.body);
    // get errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // if there are errors, I send them to the client

      res.status(400).json({ message: `${errors.array()[0].msg}` });
      return;
    }

    const user = await User.findOne({ username: req.body.username }).exec();
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'could not find user',
      });
      return;
    }

    const isValid = await validPassword(req.body.password, user.hash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        message: 'invalid password',
      });
      return;
    }

    const accessToken = jsonwebtoken.sign(
      {
        UserInfo: {
          userID: user._id,
        },
      },
      process.env.ACCESS_TOKEN,
      { expiresIn: '15m' }
    );

    const refreshToken = jsonwebtoken.sign(
      {
        userID: user._id,
      },
      process.env.REFRESH_TOKEN,
      { expiresIn: '7d' }
    );

    res.cookie('fym_jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  }),
];

const refresh = expressAsyncHandler(async (req, res, next) => {
  const cookies = req.cookies;
  console.log('sdf');
  console.log(cookies);
  console.log('sdf');

  if (!cookies?.fym_jwt) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  console.log(cookies);
  const refreshToken = cookies.fym_jwt;

  jsonwebtoken.verify(
    refreshToken,
    process.env.REFRESH_TOKEN,
    async (err, decoded) => {
      if (err) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }
      const foundUser = await User.findById(decoded.userID);

      if (!foundUser) {
        res.status(401).json({ message: 'Unauthorize' });
        return;
      }

      const accessToken = jsonwebtoken.sign(
        {
          UserInfo: {
            userID: foundUser._id,
          },
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: '15m' }
      );

      res.json({ accessToken });
    }
  );
});

const logOut = (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.fym_jwt) {
    return res.sendStatus(204);
  }
  res.clearCookie('fym_jwt', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  });

  res.json({ message: 'Cookie cleared' });
};

export default {
  register,
  login,
  refresh,
  logOut,
};
