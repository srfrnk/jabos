import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler'
import promMid from 'express-prometheus-middleware';

import gitRepositories from './gitRepositories';
import dockerImages from './dockerImages';
import jsonnetManifests from './jsonnetManifests';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});

app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
  requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  /**
   * Uncomenting the `authenticate` callback will make the `metricsPath` route
   * require authentication. This authentication callback can make a simple
   * basic auth test, or even query a remote server to validate access.
   * To access /metrics you could do:
   * curl -X GET user:password@localhost:9091/metrics
   */
  // authenticate: req => req.headers.authorization === 'Basic dXNlcjpwYXNzd29yZA==',
  /**
   * Uncommenting the `extraMasks` config will use the list of regexes to
   * reformat URL path names and replace the values found with a placeholder value
  */
  // extraMasks: [/..:..:..:..:..:../],
  /**
   * The prefix option will cause all metrics to have the given prefix.
   * E.g.: `app_prefix_http_requests_total`
   */
  prefix: 'jabos_operator_',
  /**
   * Can add custom labels with customLabels and transformLabels options
   */
  // customLabels: ['contentType'],
  // transformLabels(labels, req) {
  //   // eslint-disable-next-line no-param-reassign
  //   labels.contentType = req.headers['content-type'];
  // },
}));

app.get('/', asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
  response.status(200).json({ status: 'ok' });
}));

app.post('/git-repositories-sync', asyncHandler(gitRepositories.sync));
app.post('/git-repositories-customize', asyncHandler(gitRepositories.customize));

app.post('/docker-images-sync', asyncHandler(dockerImages.sync));
app.post('/docker-images-customize', asyncHandler(dockerImages.customize));

app.post('/jsonnet-manifests-sync', asyncHandler(jsonnetManifests.sync));
app.post('/jsonnet-manifests-customize', asyncHandler(jsonnetManifests.customize));

app.use((err, req, res, next) => {
  console.error("Unhandled Exception:", err);
  res.status(500).send(err);
});
