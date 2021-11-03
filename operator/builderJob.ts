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
  metricLabels: {}
}) {
  return {
    "apiVersion": "batch/v1",
    "kind": "Job",
    "metadata": {
      "name": options.jobName
    },
    "spec": {
      "completions": 1,
      "completionMode": "NonIndexed",
      "backoffLimit": 100,
      "activeDeadlineSeconds": 3600,
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
          "initContainers": ([
            {
              "image": `${settings.imagePrefix()}pre-builder:${settings.buildNumber()}`,
              "args": [options.repoUrl, options.repoBranch, options.commit, options.metricName, JSON.stringify(options.metricLabels)],
              "env": ([
                {
                  "name": "JABOS_OPERATOR_URL",
                  "value": `http://operator.${settings.namespace()}:${settings.port()}/`
                },
              ] as any[]).concat(!options.repoSsh ? [] : [
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
              ]),
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
            }
          ] as any[]).concat(options.containers),
          "containers": [
            {
              "image": `${options.imagePrefix}post-builder:${options.buildNumber}`,
              "args": [options.type, options.name, options.namespace, options.commit, options.metricName, JSON.stringify(options.metricLabels)],
              "env": [
                {
                  "name": "JABOS_OPERATOR_URL",
                  "value": `http://operator.${settings.namespace()}:${settings.port()}/`
                },
              ],
              "volumeMounts": [
                {
                  "name": "timer",
                  "mountPath": "/timer",
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
          "volumes": (options.volumes || []).concat([
            {
              "name": "git-temp",
              "emptyDir": {}
            },
            {
              "name": "timer",
              "emptyDir": {}
            }
          ])
        }
      }
    }
  };
}