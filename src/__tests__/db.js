import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// For mongodb-memory-server's old version (< 7) use this instead:
// const mongoServer = new MongoMemoryServer();

const opts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Provide connection to a new in-memory database server.
const initializeMongoServer = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);

  mongoose.connection.on('error', (e) => {
    if (e.message.code === 'ETIMEDOUT') {
      console.log(e);
      mongoose.connect(mongoUri);
    }
    console.log(e);
  });

  mongoose.connection.once('open', () => {
    console.log(`MongoDB successfully connected to ${mongoUri}`);
  });
};

// Remove and close the database and server.
const close = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

// Remove all data from collections
const clear = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany();
  }
};

export default {
  initializeMongoServer,
  close,
  clear,
};
