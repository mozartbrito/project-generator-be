import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Verify that the OPENAI_API_KEY is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in the environment variables.');
  process.exit(1);
}

// Rest of your imports and code...
import express from 'express';
import cors from 'cors';
import { userRouter } from './routes/userRoutes';
import { codeGenerationRouter } from './routes/codeGenerationRoutes';
import { setupDatabase } from './database/setup';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Setup database
setupDatabase();

// Routes
app.use('/api/users', userRouter);
app.use('/api/code-generation', codeGenerationRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

