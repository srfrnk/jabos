import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler'

import gitRepositories from './gitRepositories';
import dockerImages from './dockerImages';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});

app.get('/', asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
  response.status(200).json({ status: 'ok' });
}));

app.post('/git-repositories-sync', asyncHandler(gitRepositories.sync));
app.post('/git-repositories-customize', asyncHandler(gitRepositories.customize));

app.post('/docker-images-sync', asyncHandler(dockerImages.sync));
app.post('/docker-images-customize', asyncHandler(dockerImages.customize));

app.use((err, req, res, next) => {
  console.error("Unhandled Exception:", err);
  res.status(500).send(err);
});
