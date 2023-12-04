import setupServer from './src/utils/setupServer.js';

import connectDB from './config/dbConfig.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT;
//-----------------MONGOOSE CONNECT----------

// connect to MongoDB
connectDB();

const app = setupServer();

mongoose.connection.once('open', () => {
  console.log('connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

mongoose.connection.on('error', (err) => {
  console.log(err);
});
