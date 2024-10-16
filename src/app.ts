import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

const app: Express = express();

dotenv.config();

const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Typescript + Node.js + Express Server');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at <https://localhost>:${port}`);
});