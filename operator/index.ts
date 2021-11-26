import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler'
import prometheusMiddleware from 'express-prometheus-middleware';

import gitRepositories from './gitRepositories';
import dockerImages from './dockerImages';
import settings from './settings';
import { addMetricReq, setMetricReq } from './metrics';
import jsonnetManifests from './jsonnetManifests';
import plainManifests from './plainManifests';
import helmTemplateManifests from './helmTemplateManifests';

const app = express();

app.use(express.json());

app.listen(settings.port(), () => {
  console.log(`Server running on port ${settings.port()}.`);
});

app.use(prometheusMiddleware({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
  requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  prefix: settings.prometheusMetricPrefix(),
}));

app.get('/', asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
  response.status(200).json({ status: 'ok' });
}));

app.post('/addMetric/:metric', asyncHandler(addMetricReq));
app.post('/setMetric/:metric', asyncHandler(setMetricReq));

app.post('/git-repositories-sync', asyncHandler(gitRepositories.sync));
app.post('/git-repositories-customize', asyncHandler(gitRepositories.customize));

app.post('/docker-images-sync', asyncHandler(dockerImages.sync));
app.post('/docker-images-customize', asyncHandler(dockerImages.customize));

app.post('/jsonnet-manifests-sync', asyncHandler(jsonnetManifests.sync));
app.post('/jsonnet-manifests-customize', asyncHandler(jsonnetManifests.customize));

app.post('/plain-manifests-sync', asyncHandler(plainManifests.sync));
app.post('/plain-manifests-customize', asyncHandler(plainManifests.customize));

app.post('/helm-template-manifests-sync', asyncHandler(helmTemplateManifests.sync));
app.post('/helm-template-manifests-customize', asyncHandler(helmTemplateManifests.customize));

app.use((err, req, res, next) => {
  console.error("Unhandled Exception:", err);
  res.status(500).send(err);
});
