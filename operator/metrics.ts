import { Request, Response, NextFunction } from 'express';

import prometheusClient from 'prom-client';
import settings from './settings';

const metrics = {
  latestCommitChanged: new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}latest_commit_changed`,
    help: 'new "latest commit" detected for git repository',
    labelNames: ['namespace', 'git_repository', 'latest_commit'],
  }),

  dockerImageBuildTrigger: new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}docker_image_build_trigger`,
    help: 'new build triggered for a docker image',
    labelNames: ['namespace', 'docker_image', 'commit'],
  }),

  gitRepositoryUpdaterStart: new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}git_repository_updater_start`,
    help: 'GitRepositoryUpdater start',
    labelNames: ['namespace', 'git_repository'],
  }),

  gitRepositoryUpdaterEnd: new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}git_repository_updater_end`,
    help: 'GitRepositoryUpdater end',
    labelNames: ['namespace', 'git_repository', 'success', 'latest_commit_update'],
  }),

  gitRepositoryUpdaterDuration: new prometheusClient.Gauge({
    name: `${settings.prometheusMetricPrefix()}git_repository_updater_duration`,
    help: 'GitRepositoryUpdater duration',
    labelNames: ['namespace', 'git_repository', 'latest_commit_update'],
  }),

  dockerImageBuilderStart: new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}docker_image_builder_start`,
    help: 'DockerImageBuilder start',
    labelNames: ['namespace', 'docker_image'],
  }),

  dockerImageBuilderEnd: new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}docker_image_builder_end`,
    help: 'DockerImageBuilder end',
    labelNames: ['namespace', 'docker_image', 'success'],
  }),

  dockerImageBuilderDuration: new prometheusClient.Gauge({
    name: `${settings.prometheusMetricPrefix()}docker_image_builder_duration`,
    help: 'DockerImageBuilder duration',
    labelNames: ['namespace', 'docker_image'],
  }),
};

function setupManifestMetrics(type: string, label: string, descriptionName: string): void {
  metrics[`${type}ManifestsBuildTrigger`] = new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}${label}_manifests_build_trigger`,
    help: 'new build triggered for ${descriptionName} manifests',
    labelNames: ['namespace', `${label}_manifests`, 'commit'],
  });

  metrics[`${type}ManifestsBuilderStart`] = new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}${label}_manifests_builder_start`,
    help: `${descriptionName}ManifestsBuilder start`,
    labelNames: ['namespace', `${label}_manifests`],
  });

  metrics[`${type}ManifestsBuilderEnd`] = new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}${label}_manifests_builder_end`,
    help: `${descriptionName}ManifestsBuilder end`,
    labelNames: ['namespace', `${label}_manifests`, 'success'],
  });

  metrics[`${type}ManifestsBuilderDuration`] = new prometheusClient.Gauge({
    name: `${settings.prometheusMetricPrefix()}${label}_manifests_builder_duration`,
    help: `${descriptionName}ManifestsBuilder duration`,
    labelNames: ['namespace', `${label}_manifests`],
  });
}

setupManifestMetrics('jsonnet', 'jsonnet', 'Jsonnet');
setupManifestMetrics('plain', 'plain', 'Plain');
setupManifestMetrics('helmTemplate', 'helm_template', 'HelmTemplate');

export function addMetric(metric: string, labels: any) {
  if (metrics.hasOwnProperty(metric)) {
    metrics[metric].inc(labels, 1);
  }
  else {
    console.error(`Missing metric label "${metric}"`);
  }
}

export function setMetric(metric: string, labels: any, value: number) {
  if (metrics.hasOwnProperty(metric)) {
    metrics[metric].set(labels, value);
  }
  else {
    console.error(`Missing metric label "${metric}"`);
  }
}

export async function addMetricReq(request: Request, response: Response, next: NextFunction) {
  var metric = request.params.metric;
  var labels = request.body;

  addMetric(metric, labels);

  response.status(200).json({});
}

export async function setMetricReq(request: Request, response: Response, next: NextFunction) {
  var metric = request.params.metric;
  var value = parseFloat(typeof request.query.value === "string" ? request.query.value : "0");
  var labels = request.body;

  setMetric(metric, labels, value);

  response.status(200).json({});
}
