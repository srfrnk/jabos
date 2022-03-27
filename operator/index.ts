import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler'
// import prometheusMiddleware from 'express-prometheus-middleware';

import gitRepositories from './gitRepositories';
import dockerImages from './dockerImages';
import settings from './settings';
import { addMetricReq, setMetricReq } from './metrics';
import jsonnetManifests from './jsonnetManifests';
import plainManifests from './plainManifests';
import helmTemplateManifests from './helmTemplateManifests';
import kustomizeManifests from './kustomizeManifests';
import cdk8sManifests from './cdk8sManifests';


const app = express();

app.use(express.json({ limit: settings.expressJsonRequestPayloadLimit() }));

app.listen(settings.port(), () => {
  console.log(`Server running on port ${settings.port()}.`);
});

// app.use(prometheusMiddleware({
//   metricsPath: '/metrics',
//   collectDefaultMetrics: true,
//   requestDurationBuckets: [0.1, 0.5, 1, 1.5],
//   requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
//   responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
//   prefix: settings.prometheusMetricPrefix(),
// }));

app.get('/', asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
  response.status(200).json({ status: 'ok' });
}));

app.post('/addMetric/:metric', asyncHandler(addMetricReq));
app.post('/setMetric/:metric', asyncHandler(setMetricReq));

registerCrdHooks('git-repositories', gitRepositories);
registerCrdHooks('docker-images', dockerImages);

registerManifestCrdHooks('jsonnet', jsonnetManifests);
registerManifestCrdHooks('plain', plainManifests);
registerManifestCrdHooks('helm-template', helmTemplateManifests);
registerManifestCrdHooks('kustomize', kustomizeManifests);
registerManifestCrdHooks('cdk8s', cdk8sManifests);

app.use((err, req, res, next) => {
  console.error("Unhandled Exception:", err);
  res.status(500).send(err);
});

type Handler = (syncRequest: Request, response: Response, next: NextFunction) => void;

function registerCrdHooks(crdName: string, controller: { sync: Handler, customize: Handler, finalize: Handler }) {
  app.post(`/${crdName}-sync`, asyncHandler(controller.sync));
  app.post(`/${crdName}-customize`, asyncHandler(controller.customize));
  app.post(`/${crdName}-finalize`, asyncHandler(controller.finalize));
}

function registerManifestCrdHooks(manifestCrdName: string, controller: { sync: Handler, customize: Handler, finalize: Handler }) {
  registerCrdHooks(`${manifestCrdName}-manifests`, controller);
}
