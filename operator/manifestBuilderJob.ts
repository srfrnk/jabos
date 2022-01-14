import builderJob from './builderJob';
import { Repo } from './misc';
import settings from './settings';

export default function (options: {
  object: any,
  repo: Repo,
  imagePrefix: string,
  buildNumber: string,
  type: string,
  containers: any[],
  metricName: string,
  metricLabels: {}
}) {
  options.containers.forEach(container => {
    container.volumeMounts = [
      ...(container.volumeMounts || []),
      {
        "name": "manifests",
        "mountPath": "/manifests",
      }
    ];
  });

  var targetNamespace = options.object.spec.targetNamespace;

  return builderJob({
    object: options.object,
    repo: options.repo,
    jobNamePrefix: 'manifest',
    imagePrefix: settings.imagePrefix(),
    buildNumber: settings.buildNumber(),
    serviceAccountName: `builder-${options.object.spec.gitRepository}`,
    type: options.type,
    metricName: options.metricName,
    metricLabels: options.metricLabels,
    labels: { type: "manifest-builder", "manifest-builder-type": options.type },
    containers: [
      ...options.containers,
      {
        "image": `${options.imagePrefix}manifest-deployer:${options.buildNumber}`,
        "args": [targetNamespace, options.type, options.object.metadata.name],
        "env": [
          {
            "name": "NAMESPACE",
            "value": options.object.metadata.namespace
          },
          {
            "name": "TARGET_NAMESPACE",
            "value": targetNamespace
          },
          {
            "name": "TYPE",
            "value": options.type
          },
          {
            "name": "NAME",
            "value": options.object.metadata.name
          },

        ],
        "name": "manifest-deployer",
        "volumeMounts": [
          {
            "name": "manifests",
            "mountPath": "/manifests",
            "readOnly": true
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
    ],
    "volumes": [
      {
        "name": "manifests",
        "emptyDir": {}
      }
    ]
  });
}