import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

const app: Express = express();

dotenv.config();

const port = process.env.PORT;

import userRouter from './routes/users';
import projectRouter from './routes/Projects';
import issueRouter from './routes/issues';

app.use('/users', userRouter);
app.use('/projects', projectRouter);
app.use('/issues', issueRouter);  
app.use(cors());

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});

export default app;