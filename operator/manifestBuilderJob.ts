import builderJob from './builderJob';
import settings from './settings';

export default function (options: {
  imagePrefix: string,
  buildNumber: string,
  type: string,
  name: string,
  namespace: string,
  targetNamespace: string,
  commit: string,
  containers: any[]
}) {
  var jobName = `manifest-${options.name}-${options.commit}`.substring(0, 62);
  options.containers.forEach(container => {
    container.volumeMounts = [
      {
        "name": "manifests",
        "mountPath": "/manifests",
      }
    ].concat(container.volumeMounts || []);
  });
  return builderJob({
    jobName,
    imagePrefix: settings.imagePrefix(),
    buildNumber: settings.buildNumber(),
    commit: options.commit,
    name: options.name,
    namespace: options.namespace,
    type: options.type,
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