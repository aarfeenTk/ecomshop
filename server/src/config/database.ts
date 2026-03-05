import mongoose from 'mongoose';
import logger from './logger';
import { ServiceUnavailableError } from '../errors';

interface MongooseConnectionOptions {
  maxRetries?: number;
  retryDelay?: number;
  serverSelectionTimeoutMS?: number;
  socketTimeoutMS?: number;
}

const connectDB = async (options: MongooseConnectionOptions = {}): Promise<void> => {
  const {
    maxRetries = 5,
    retryDelay = 3000,
    serverSelectionTimeoutMS = 30000,
    socketTimeoutMS = 45000,
  } = options;

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    logger.error('MongoDB URI is not defined in environment variables');
    throw new ServiceUnavailableError('Database configuration error');
  }

  let retries = 0;
  let connected = false;

  const mongooseOptions: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS,
    socketTimeoutMS,
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    retryReads: true,
    w: 'majority',
    readPreference: 'secondaryPreferred',
    authSource: 'admin',
  };

  const connect = async (): Promise<void> => {
    try {
      const conn = await mongoose.connect(mongoUri, mongooseOptions);
      connected = true;
      
      logger.info('MongoDB connected successfully', {
        host: conn.connection.host,
        port: conn.connection.port,
        name: conn.connection.name,
      });

      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', { error: error.message });
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Attempting to reconnect...');
        connected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected successfully');
        connected = true;
      });

      process.on('SIGINT', async () => {
        try {
          await mongoose.connection.close();
          logger.info('MongoDB connection closed through app termination');
          process.exit(0);
        } catch (error) {
          logger.error('Error closing MongoDB connection:', { error: (error as Error).message });
          process.exit(1);
        }
      });

      process.on('SIGTERM', async () => {
        try {
          await mongoose.connection.close();
          logger.info('MongoDB connection closed through app termination');
          process.exit(0);
        } catch (error) {
          logger.error('Error closing MongoDB connection:', { error: (error as Error).message });
          process.exit(1);
        }
      });
    } catch (error) {
      retries++;
      const errorMessage = (error as Error).message;
      
      logger.error(`MongoDB connection attempt ${retries}/${maxRetries} failed`, {
        error: errorMessage,
        retriesLeft: maxRetries - retries,
      });

      if (retries >= maxRetries) {
        logger.error('Max retry attempts reached. Could not connect to MongoDB');
        throw new ServiceUnavailableError('Unable to connect to database');
      }

      const delay = retryDelay * Math.pow(2, retries - 1);
      logger.info(`Retrying connection in ${delay}ms...`);
      
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connect();
    }
  };

  await connect();

  if (!connected) {
    throw new ServiceUnavailableError('Failed to establish database connection');
  }
};

export default connectDB;
