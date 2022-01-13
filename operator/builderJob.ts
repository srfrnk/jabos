import jabosOperatorUrlEnv from './jabosOperatorUrlEnv';
import settings from './settings';

export default function (options: {
  jobName: string,
  imagePrefix: string,
  buildNumber: string,
  type: string,
  name: string,
  serviceAccountName: string,
  namespace: string,
  commit: string,
  repoUrl: string,
  repoBranch: string,
  repoSsh: { secret: string, passphrase: string, key: string },
  containers: any[],
  volumes?: any[],
  metricName: string,
  metricLabels: {},
  labels: {}
}): any {
  (options.containers || []).forEach(container => {
    container.imagePullPolicy = settings.imagePullPolicy();

    container.securityContext = {
      ...container.securityContext,
      "readOnlyRootFilesystem": true,
      "allowPrivilegeEscalation": false,
      "runAsNonRoot": true,
      "capabilities": {
        "drop": ['ALL'],
      },
    };

    container.volumeMounts = [
      ...(container.volumeMounts || []),
      {
        "name": "temp",
        "mountPath": "/tmp",
      },
      {
        "name": "build",
        "mountPath": "/build",
      }
    ];
  });

  return {
    "apiVersion": "batch/v1",
    "kind": "Job",
    "metadata": {
      "name": options.jobName,
      "labels": options.labels
    },
    "spec": {
      "completions": 1,
      "completionMode": "NonIndexed",
      "backoffLimit": 100,
      "activeDeadlineSeconds": parseInt(settings.jobActiveDeadlineSeconds()),
      "ttlSecondsAfterFinished": 30,
      "parallelism": 1,
      "template": {
        "metadata": {
          "name": options.jobName,
          "labels": {
            "builder": options.jobName
          }
        },
        "spec": {
          "serviceAccountName": options.serviceAccountName,
          "restartPolicy": "OnFailure",
          "securityContext": {
            "runAsNonRoot": true,
          },
          "initContainers": [
            {
              "image": `${settings.imagePrefix()}pre-builder:${settings.buildNumber()}`,
              "args": [],
              "env": [
                {
                  "name": "URL",
                  "value": options.repoUrl
                },
                {
                  "name": "BRANCH",
                  "value": options.repoBranch
                },
                {
                  "name": "COMMIT",
                  "value": options.commit
                },
                {
                  "name": "METRIC_NAME",
                  "value": options.metricName
                },
                {
                  "name": "METRIC_LABELS",
                  "value": JSON.stringify(options.metricLabels)
                },
                {
                  "name": "NAMESPACE",
                  "value": options.namespace
                },
                {
                  "name": "NAME",
                  "value": options.name
                },
                ...jabosOperatorUrlEnv(), ...(!options.repoSsh ? [] : [
                  {
                    "name": "SSH_PASSPHRASE",
                    "valueFrom": {
                      "secretKeyRef": {
                        "name": options.repoSsh.secret,
                        "key": options.repoSsh.passphrase
                      }
                    }
                  },
                  {
                    "name": "SSH_KEY",
                    "valueFrom": {
                      "secretKeyRef": {
                        "name": options.repoSsh.secret,
                        "key": options.repoSsh.key
                      }
                    }
                  }
                ])],
              "imagePullPolicy": settings.imagePullPolicy(),
              "securityContext": {
                "readOnlyRootFilesystem": true,
                "allowPrivilegeEscalation": false,
                "runAsNonRoot": true,
                "capabilities": {
                  "drop": ['ALL'],
                },
              },
              "name": "pre-builder",
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
              "volumeMounts": [
                {
                  "name": "git-temp",
                  "mountPath": "/gitTemp",
                },
                {
                  "name": "temp",
                  "mountPath": "/tmp",
                },
                {
                  "name": "timer",
                  "mountPath": "/timer",
                }
              ]
            },
            ...options.containers
          ],
          "containers": [
            {
              "image": `${options.imagePrefix}post-builder:${options.buildNumber}`,
              "args": [],
              "env": [
                {
                  "name": "TYPE",
                  "value": options.type
                },
                {
                  "name": "NAME",
                  "value": options.name
                },
                {
                  "name": "COMMIT",
                  "value": options.commit
                },
                {
                  "name": "METRIC_NAME",
                  "value": options.metricName
                },
                {
                  "name": "METRIC_LABELS",
                  "value": JSON.stringify(options.metricLabels)
                },
                {
                  "name": "NAMESPACE",
                  "value": options.namespace
                },
                ...jabosOperatorUrlEnv()],
              "volumeMounts": [
                {
                  "name": "timer",
                  "mountPath": "/timer",
                  "readOnly": true
                },
                {
                  "name": "temp",
                  "mountPath": "/tmp"
                }
              ],
              "imagePullPolicy": settings.imagePullPolicy(),
              "securityContext": {
                "readOnlyRootFilesystem": true,
                "allowPrivilegeEscalation": false,
                "runAsNonRoot": true,
                "capabilities": {
                  "drop": ['ALL'],
                },
              },
              "name": "post-builder",
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
            ...(options.volumes || []),
            {
              "name": "git-temp",
              "emptyDir": {}
            },
            {
              "name": "temp",
              "emptyDir": {}
            },
            {
              "name": "build",
              "emptyDir": {}
            },
            {
              "name": "timer",
              "emptyDir": {}
            }
          ]
        }
      }
    }
  };
}