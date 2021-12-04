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
  volumes: any[],
  metricName: string,
  metricLabels: {},
  labels: {}
}) {
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
          "initContainers": [
            {
              "image": `${settings.imagePrefix()}pre-builder:${settings.buildNumber()}`,
              "args": [options.repoUrl, options.repoBranch, options.commit, options.metricName, JSON.stringify(options.metricLabels)],
              "env": [...jabosOperatorUrlEnv(), ...(!options.repoSsh ? [] : [
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
              "imagePullPolicy": "IfNotPresent",
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
              "args": [options.type, options.name, options.namespace, options.commit, options.metricName, JSON.stringify(options.metricLabels)],
              "env": jabosOperatorUrlEnv(),
              "volumeMounts": [
                {
                  "name": "timer",
                  "mountPath": "/timer",
                  "readOnly": true
                }
              ],
              "imagePullPolicy": "IfNotPresent",
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
              "name": "timer",
              "emptyDir": {}
            }
          ]
        }
      }
    }
  };
}