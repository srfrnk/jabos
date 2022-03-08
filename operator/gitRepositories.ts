import { App, Chart } from 'cdk8s';
import { Request, Response, NextFunction } from 'express';
import gitRepositorySshSecretEnv from './gitRepositorySshSecretEnv';
import { KubeJob, KubeRole, KubeRoleBinding, KubeServiceAccount, Quantity } from './imports/k8s';
import jabosOperatorUrlEnv from './jabosOperatorUrlEnv';
import { CustomizeRequest, CustomizeResponse, FinalizeRequest, FinalizeResponse, SyncRequest, SyncResponse } from './metaControllerHooks';
import { debugId } from './misc';
import settings from './settings';

export default {
  async sync(syncRequest: Request, response: Response, next: NextFunction) {
    const request: SyncRequest = syncRequest.body;
    if (settings.debug()) console.log(`gitRepositories sync req (${debugId(request.object)})`, JSON.stringify(request));

    const name: string = request.object.metadata.name;
    const uid: string = request.object.metadata.uid;
    const namespace: string = request.object.metadata.namespace;
    const repo: any = request.object.spec;
    const lastCommit: string = (request.object.status || {}).lastCommit;

    const jobName = `git-repository-updater-${name}`;

    const attachments = new Chart(new App(), 'attachments');

    const role = new KubeRole(attachments, `builder-${name}-role`, {
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
    });

    const roleBinding = new KubeRoleBinding(attachments, `builder-${name}-rb`, {
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
    });

    const serviceAccount = new KubeServiceAccount(attachments, `builder-${name}-sa`, {
      "metadata": {
        "name": `builder-${name}`,
        "namespace": namespace,
      },
    });

    roleBinding.addDependency(role);
    roleBinding.addDependency(serviceAccount);

    if (!repo.promotedCommit) {
      const job = new KubeJob(attachments, jobName, {
        "metadata": {
          "name": jobName,
          "labels": {
            "type": "git-repository-updater"
          },
        },
        "spec": {
          "completions": 1,
          "completionMode": "NonIndexed",
          "backoffLimit": parseInt(settings.jobBackoffLimit()),
          "activeDeadlineSeconds": parseInt(settings.jobActiveDeadlineSeconds()),
          "ttlSecondsAfterFinished": parseInt(settings.jobTtlSecondsAfterFinished()),
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
                      "cpu": Quantity.fromString("500m"),
                      "memory": Quantity.fromString("500Mi")
                    },
                    "requests": {
                      "cpu": Quantity.fromString("100m"),
                      "memory": Quantity.fromString("100Mi")
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
      });

      job.addDependency(roleBinding);
    }

    const res: SyncResponse = new SyncResponse({
      "attachments": attachments,
      ...(repo.promotedCommit && {
        "status": {
          "latestCommit": repo.promotedCommit,
          "conditions": [
            {
              "type": "Syncing",
              "status": "True",
            },
          ]
        }
      })
    });

    if (settings.debug()) console.log(`gitRepositories sync res (${debugId(request.object)})`, JSON.stringify(res.toJson()));
    response.status(200).json(res.toJson());
  },

  async customize(customizeRequest: Request, response: Response, next: NextFunction) {
    const request: CustomizeRequest = customizeRequest.body;
    if (settings.debug()) console.log(`gitRepositories customize req (${debugId(request.parent)})`, JSON.stringify(request));

    const res: CustomizeResponse = new CustomizeResponse({
      relatedResources: []
    });

    if (settings.debug()) console.log(`gitRepositories customize res (${debugId(request.parent)})`, JSON.stringify(res.toJson()));
    response.status(200).json(res.toJson());
  },

  async finalize(finalizeRequest: Request, response: Response, next: NextFunction) {
    const request: FinalizeRequest = finalizeRequest.body;
    if (settings.debug()) console.log(`gitRepositories finalize req (${debugId(request.object)})`, JSON.stringify(request));

    const res: FinalizeResponse = new FinalizeResponse({
      annotations: {},
      attachments: new Chart(new App(), 'attachments'),
      finalized: true,
    })

    if (settings.debug()) console.log(`gitRepositories finalize res (${debugId(request.object)})`, JSON.stringify(res.toJson()));
    response.status(200).json(res.toJson());
  }
}
