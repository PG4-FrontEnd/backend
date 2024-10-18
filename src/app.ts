import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRouter from './routes/users';
import issueRouter from './routes/issues';
import projectRouter from './routes/projects';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api/users', userRouter);
app.use('/api/issues', issueRouter);
app.use('/api/projects', projectRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
