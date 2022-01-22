import { Request, Response, NextFunction } from 'express';
import gitRepositorySshSecretEnv from './gitRepositorySshSecretEnv';
import jabosOperatorUrlEnv from './jabosOperatorUrlEnv';
import { debugId } from './misc';
import settings from './settings';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log(`gitRepositories sync req (${debugId(request)})`, JSON.stringify(request.body));

    var name: string = request.body.object.metadata.name;
    var uid: string = request.body.object.metadata.uid;
    var namespace: string = request.body.object.metadata.namespace;
    var repo: any = request.body.object.spec;
    var lastCommit: string = (request.body.object.status || {}).lastCommit;

    var jobName = `git-repository-updater-${name}`;

    var res = {
      "attachments": [
        {
          "apiVersion": "rbac.authorization.k8s.io/v1",
          "kind": "Role",
          "metadata": {
            "name": `builder-${name}`,
            "namespace": namespace,
          },
          "rules": [
            {
              "apiGroups": ["jabos.io"],
              "resources": ["docker-images/status", "jsonnet-manifests/status", "git-repositories/status"],
              "verbs": ["patch"],
            },
            {
              "apiGroups": ["events.k8s.io"],
              "resources": ["events"],
              "verbs": ["get", "list", "watch", "create", "update", "patch"],
            }
          ],
        },
        {
          "apiVersion": "rbac.authorization.k8s.io/v1",
          "kind": "RoleBinding",
          "metadata": {
            "name": `builder-${name}`,
            "namespace": namespace,
          },
          "roleRef": {
            "apiGroup": "rbac.authorization.k8s.io",
            "kind": "Role",
            "name": `builder-${name}`,
          },
          "subjects": [
            {
              "kind": "ServiceAccount",
              "namespace": namespace,
              "name": `builder-${name}`,
            }
          ],
        },
        {
          "apiVersion": 'v1',
          "kind": 'ServiceAccount',
          "metadata": {
            "name": `builder-${name}`,
            "namespace": namespace,
          },
        },
        {
          "apiVersion": "batch/v1",
          "kind": "Job",
          "metadata": {
            "name": jobName,
            "labels": {
              "type": "git-repository-updater"
            },
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
                  "job": jobName
                }
              },
              "spec": {
                "serviceAccountName": `builder-${name}`,
                "restartPolicy": "Never",
                "securityContext": {
                  "runAsNonRoot": true,
                },
                "containers": [
                  {
                    "image": `${settings.imagePrefix()}git-repository-updater:${settings.buildNumber()}`,
                    "args": [],
                    "stdin": true,
                    "tty": true,
                    "env": [
                      {
                        "name": "URL",
                        "value": repo.url
                      },
                      {
                        "name": "BRANCH",
                        "value": repo.branch
                      },
                      {
                        "name": "NAMESPACE",
                        "value": namespace
                      },
                      {
                        "name": "NAME",
                        "value": name
                      },
                      {
                        "name": "OBJECT_UID",
                        "value": uid
                      },
                      {
                        "name": "CURRENT_COMMIT",
                        "value": lastCommit
                      },
                      ...jabosOperatorUrlEnv(), ...gitRepositorySshSecretEnv(repo.ssh)],
                    "name": "git-repository-updater",
                    "imagePullPolicy": settings.imagePullPolicy(),
                    "securityContext": {
                      "readOnlyRootFilesystem": true,
                      "allowPrivilegeEscalation": false,
                      "runAsNonRoot": true,
                      "capabilities": {
                        "drop": ['ALL'],
                      },
                    },
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
                      }
                    ]
                  }
                ],
                volumes: [
                  {
                    "name": "git-temp",
                    "emptyDir": {}
                  },
                  {
                    "name": "temp",
                    "emptyDir": {}
                  },
                ]
              }
            }
          }
        }
      ],
    };

    if (settings.debug()) console.log(`gitRepositories sync res (${debugId(request)})`, JSON.stringify(res));
    response.status(200).json(res);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log(`gitRepositories customize req (${debugId(request)})`, JSON.stringify(request.body));

    var res = {
      "relatedResources": []
    };

    if (settings.debug()) console.log(`gitRepositories customize res (${debugId(request)})`, JSON.stringify(res));
    response.status(200).json(res);
  },

  async finalize(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log(`gitRepositories finalize req (${debugId(request)})`, JSON.stringify(request.body));

    var res = {
      "annotations": {},
      "attachments": [],
      "finalized": true,
    }

    if (settings.debug()) console.log(`gitRepositories finalize res (${debugId(request)})`, JSON.stringify(res));
    response.status(200).json(res);
  }
}
