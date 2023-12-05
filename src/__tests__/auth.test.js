import supertest from 'supertest';
import db from './db.js';
import cookieParser from 'cookie-parser';
import authRouter from '../routes/authRouter.js';
import express from 'express';
import User from '../models/User.js';
import { userJoeInDB, userJoeCredential } from './tests_auth_data.js';
import jsonwebtoken from 'jsonwebtoken';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/auth', authRouter);

beforeAll(async () => {
  await db.initializeMongoServer();
});
beforeEach(async () => await db.clear());
afterAll(async () => await db.close());

const jwtSign = jest.spyOn(jsonwebtoken, 'sign');
const jwtVerify = jest.spyOn(jsonwebtoken, 'verify');

describe('auth', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('POST/signUp', () => {
    describe('Register user', () => {
      beforeEach(async () => {
        await User.create(userJoeInDB);
      });

      it('should return a 400, when data is incomplete', async () => {
        await supertest(app)
          .post('/auth/signUp')
          .send({ password: 'asdASD123@' })
          .expect(400);
      });

      it('should return a 201, when data is complete', async () => {
        await supertest(app)
          .post('/auth/signUp')
          .send({ password: 'asdASD123@', username: 'bober' })
          .expect(201);
      });

      it('should return a 400, when username already exist', async () => {
        await supertest(app)
          .post('/auth/signUp')
          .send(userJoeCredential)
          .expect(400);
      });
    });
  });

  describe('POST/login', () => {
    describe('login', () => {
      beforeEach(() => {
        User.create(userJoeInDB);
      });

      it('should return a 400, when data is incomplete', async () => {
        await supertest(app)
          .post('/auth/login')
          .send({ password: 'asd' })
          .expect(400);
      });

      it('should return a 404, when user dosent exist', async () => {
        await supertest(app)
          .post('/auth/login')
          .send({ password: 'asdASD123@', username: 'noexist' })
          .expect(404);
      });

      it('should return a 401, when password is wrong', async () => {
        await supertest(app)
          .post('/auth/login')
          .send({ password: 'asdASD123@2', username: userJoeInDB.username })
          .expect(401);
      });
    });

    describe('success login', () => {
      beforeEach(async () => {
        await User.create(userJoeInDB);
      });

      it('should return a 200', async () => {
        jwtSign.mockImplementation(() => () => 'access.token123123');
        await supertest(app)
          .post('/auth/login')
          .send(userJoeCredential)
          .expect(200);

        expect(jwtSign).toBeCalledTimes(2);
      });
    });
  });

  describe('GET/refresh', () => {
    describe('refresh access token', () => {
      beforeEach(async () => {
        await User.create(userJoeInDB);
      });

      it('should return a 401, because user is Unauthorize', async () => {
        await supertest(app).get('/auth/refresh').expect(401);
      });

      it('should return a 403, because user is Unauthorize', async () => {
        jwtVerify.mockImplementation((token, to, cb) => {
          // get error
          cb(true, null);
        });
        await supertest(app)
          .get('/auth/refresh')
          .set('Cookie', ['fym_jwt=dfgdfggd34rf43rfd343f34f'])
          .expect(403);
      });

      it('should return a 401, because userID is invalid', async () => {
        jwtVerify.mockImplementation((token, to, cb) => {
          // wrong userID
          cb(null, { userID: '625ce762dfbab2e024ab46f2' });
        });

        await supertest(app)
          .get('/auth/refresh')
          .set('Cookie', ['fym_jwt=dfgdfggd34rf43rfd343f34f'])
          .expect(401);
      });

      it('should return a 200, ', async () => {
        jwtVerify.mockImplementation((token, to, cb) => {
          cb(null, { userID: '625ce762dfbab2e024ab46f1' });
        });

        await supertest(app)
          .get('/auth/refresh')
          .set('Cookie', ['fym_jwt=dfgdfggd34rf43rfd343f34f'])
          .expect(200);
      });
    });
  });

  describe('POST/logout', () => {
    describe('delete cookie', () => {
      it('should return a 204, because cookie does not exist', async () => {
        await supertest(app).post('/auth/logout').expect(204);
      });

      it('should return a 200, because cookie was successfully deleted', async () => {
        await supertest(app)
          .post('/auth/logout')
          .set('Cookie', ['fym_jwt=dfgdfggd34rf43rfd343f34f'])
          .expect(200);
      });
    });
  });
});
