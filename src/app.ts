import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

const app: Express = express();

dotenv.config();

const port = process.env.PORT;

import userRouter from './routes/users';

app.use('/users', userRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at <https://localhost>:${port}`);
});