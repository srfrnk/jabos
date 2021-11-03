import builderJob from './builderJob';
import settings from './settings';
import { k8sName } from './misc';

export default function (options: {
  imagePrefix: string,
  buildNumber: string,
  type: string,
  name: string,
  namespace: string,
  targetNamespace: string,
  gitRepository: string,
  commit: string,
  repoUrl: string,
  repoBranch: string,
  repoSsh: { secret: string, passphrase: string, key: string },
  containers: any[],
  metricName: string,
  metricLabels: {}
}) {
  var jobName = k8sName(`manifest-${options.name}`, options.commit);
  options.containers.forEach(container => {
    container.volumeMounts = (container.volumeMounts || []).concat([
      {
        "name": "manifests",
        "mountPath": "/manifests",
      }
    ]);
  });
  return builderJob({
    jobName,
    imagePrefix: settings.imagePrefix(),
    buildNumber: settings.buildNumber(),
    commit: options.commit,
    repoUrl: options.repoUrl,
    repoBranch: options.repoBranch,
    repoSsh: options.repoSsh,
    name: options.name,
    namespace: options.namespace,
    serviceAccountName: `builder-${options.gitRepository}`,
    type: options.type,
    metricName: options.metricName,
    metricLabels: options.metricLabels,
    containers: options.containers.concat([
      {
        "env": [],
        "image": `${options.imagePrefix}manifest-deployer:${options.buildNumber}`,
        "args": [options.targetNamespace],
        "imagePullPolicy": "IfNotPresent",
        "name": "manifest-deployer",
        "volumeMounts": [
          {
            "name": "manifests",
            "mountPath": "/manifests",
          }
        ],
        "resources": {
          "limits": {
            "cpu": "500m",
            "memory": "500Mi"
          },
          "requests": {
            "cpu": "100m",
            "memory": "100Mi"
          }
        },
      }
    ]),
    "volumes": [
      {
        "name": "manifests",
        "emptyDir": {}
      }
    ]
  });
}