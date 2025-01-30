import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './errors/AppError';
import authRoutes from './routes/auth.routes';
import loggerMiddleware from './middleware/logger.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(loggerMiddleware);
app.use('/api/auth', authRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Example route that throws an error
app.get('/error-test', (req, res, next) => {
  try {
    throw new AppError('Test error', 400);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware should be last
app.use(errorHandler);

async function main() {
  try {
    // Test database connection
    console.log('Database connection established');

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

main();
