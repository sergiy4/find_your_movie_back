import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

const dbOptions = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO, dbOptions);
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;
