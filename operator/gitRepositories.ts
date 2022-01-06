import { Request, Response, NextFunction } from 'express';
import gitRepositorySshSecretEnv from './gitRepositorySshSecretEnv';
import jabosOperatorUrlEnv from './jabosOperatorUrlEnv';
import settings from './settings';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log("gitRepositories sync req", JSON.stringify(request.body));

    var name: string = request.body.object.metadata.name;
    var uid: string = request.body.object.metadata.uid;
    var namespace: string = request.body.object.metadata.namespace;
    var repo: any = request.body.object.spec;
    var lastCommit: string = (request.body.object.status || {}).lastCommit;

    var jobName = `git-repository-updater-${name}`;
    var jobs: any[] = Object.values(request.body.attachments['Job.batch/v1']);
    var attachJob = jobs.length === 0 || jobs[0].status.succeeded !== 1;

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
              "resources": ["docker-images", "jsonnet-manifests"],
              "verbs": ["get", "list", "watch", "patch"],
            },
            {
              "apiGroups": ["jabos.io"],
              "resources": ["docker-images/status", "jsonnet-manifests/status", "git-repositories/status"],
              "verbs": ["patch"],
            },
            {
              "apiGroups": ["events.k8s.io"],
              "resources": ["events"],
              "verbs": ["create", "update", "patch"],
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
        ...(attachJob ? [{
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
                "restartPolicy": "OnFailure",
                "securityContext": {
                  "runAsNonRoot": true,
                },
                "containers": [
                  {
                    "image": `${settings.imagePrefix()}git-repository-updater:${settings.buildNumber()}`,
                    "args": [repo.url, repo.branch, namespace, name, uid, lastCommit],
                    "env": [...jabosOperatorUrlEnv(), ...gitRepositorySshSecretEnv(repo.ssh)],
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
        }] : [])
      ],
    };

    if (settings.debug()) console.log("gitRepositories sync res", JSON.stringify(res));
    response.status(200).json(res);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log("gitRepositories customize req", JSON.stringify(request.body));

    var res = {
      "relatedResources": []
    };

    if (settings.debug()) console.log("gitRepositories customize res", JSON.stringify(res));
    response.status(200).json(res);
  },

  async finalize(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log("gitRepositories finalize req", JSON.stringify(request.body));

    var res = {
      "annotations": {},
      "attachments": [],
      "finalized": true,
    }

    if (settings.debug()) console.log("gitRepositories finalize res", JSON.stringify(res));
    response.status(200).json(res);
  }
}
