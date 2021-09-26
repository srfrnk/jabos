import express, { Request, Response, NextFunction } from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Timezones by location application is running on port ${port}.`);
});

app.get('/', (request: Request, response: Response, next: NextFunction) => {
  response.status(200).json({ status: 'ok' });
});
