import jabosOperatorUrlEnv from './jabosOperatorUrlEnv';
import { k8sName, Repo } from './misc';
import settings from './settings';

export default function (options: {
  object: any,
  jobNamePrefix: string,
  imagePrefix: string,
  buildNumber: string,
  type: string,
  serviceAccountName: string,
  repo: Repo,
  containers: any[],
  volumes?: any[],
  metricName: string,
  metricLabels: {},
  labels: {}
}): any {
  var latestCommit = options.repo.status.latestCommit;
  var jobName = k8sName(`${options.jobNamePrefix}-${options.object.metadata.name}`, latestCommit);
  var repoSsh = options.repo.spec.ssh;

  (options.containers || []).forEach(container => {
    container.imagePullPolicy = settings.imagePullPolicy();

    container.env = [
      ...(container.env || []),
      {
        "name": "NAMESPACE",
        "value": options.object.metadata.namespace
      },
      {
        "name": "NAME",
        "value": options.object.metadata.name
      },
      {
        "name": "OBJECT_UID",
        "value": options.object.metadata.uid
      }
    ];

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
      "name": jobName,
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
          "name": jobName,
          "labels": {
            "builder": jobName
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
                  "value": options.repo.spec.url
                },
                {
                  "name": "BRANCH",
                  "value": options.repo.spec.branch
                },
                {
                  "name": "COMMIT",
                  "value": latestCommit
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
                  "value": options.object.metadata.namespace
                },
                {
                  "name": "NAME",
                  "value": options.object.metadata.name
                },
                {
                  "name": "OBJECT_UID",
                  "value": options.object.metadata.uid
                },
                ...jabosOperatorUrlEnv(), ...(!repoSsh ? [] : [
                  {
                    "name": "SSH_PASSPHRASE",
                    "valueFrom": {
                      "secretKeyRef": {
                        "name": repoSsh.secret,
                        "key": repoSsh.passphrase
                      }
                    }
                  },
                  {
                    "name": "SSH_KEY",
                    "valueFrom": {
                      "secretKeyRef": {
                        "name": repoSsh.secret,
                        "key": repoSsh.key
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
                  "value": options.object.metadata.name
                },
                {
                  "name": "COMMIT",
                  "value": latestCommit
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
                  "value": options.object.metadata.namespace
                },
                {
                  "name": "OBJECT_UID",
                  "value": options.object.metadata.uid
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