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

  jsonnetManifestsBuildTrigger: new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}jsonnet_manifests_build_trigger`,
    help: 'new build triggered for jsonnet manifests',
    labelNames: ['namespace', 'jsonnet_manifests', 'commit'],
  }),

  plainManifestsBuildTrigger: new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}plain_manifests_build_trigger`,
    help: 'new build triggered for plain manifests',
    labelNames: ['namespace', 'plain_manifests', 'commit'],
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

  jsonnetManifestsBuilderStart: new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}jsonnet_manifests_builder_start`,
    help: 'JsonnetManifestsBuilder start',
    labelNames: ['namespace', 'jsonnet_manifests'],
  }),

  jsonnetManifestsBuilderEnd: new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}jsonnet_manifests_builder_end`,
    help: 'JsonnetManifestsBuilder end',
    labelNames: ['namespace', 'jsonnet_manifests', 'success'],
  }),

  jsonnetManifestsBuilderDuration: new prometheusClient.Gauge({
    name: `${settings.prometheusMetricPrefix()}jsonnet_manifests_builder_duration`,
    help: 'JsonnetManifestsBuilder duration',
    labelNames: ['namespace', 'jsonnet_manifests'],
  }),

  plainManifestsBuilderStart: new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}plain_manifests_builder_start`,
    help: 'PlainManifestsBuilder start',
    labelNames: ['namespace', 'plain_manifests'],
  }),

  plainManifestsBuilderEnd: new prometheusClient.Counter({
    name: `${settings.prometheusMetricPrefix()}plain_manifests_builder_end`,
    help: 'PlainManifestsBuilder end',
    labelNames: ['namespace', 'plain_manifests', 'success'],
  }),

  plainManifestsBuilderDuration: new prometheusClient.Gauge({
    name: `${settings.prometheusMetricPrefix()}plain_manifests_builder_duration`,
    help: 'PlainManifestsBuilder duration',
    labelNames: ['namespace', 'plain_manifests'],
  }),
};

export function addMetric(metric: string, labels: any) {
  metrics[metric].inc(labels, 1);
}

export function setMetric(metric: string, labels: any, value: number) {
  metrics[metric].set(labels, value);
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
