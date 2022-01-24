import { Request, Response, NextFunction } from 'express';

import settings from './settings';
import manifestBuilderJob from './manifestBuilderJob';
import manifestBuilderRole from './manifestBuilderRole';
import manifestBuilderRoleBinding from './manifestBuilderRoleBinding';
import { addMetric } from './metrics';
import { debugId, getRepo, needBuild } from './misc';
import jabosOperatorUrlEnv from './jabosOperatorUrlEnv';

export default {
  debugRequest(typeName: string, typeFunc: string, request: Request): void {
    if (settings.debug()) console.log(`${typeName}Manifests ${typeFunc} req (${debugId(request)})`, JSON.stringify(request.body));
  },

  async sync(metricName: string, type: string, metricLabel: string, env: { [key: string]: string }, request: Request, response: Response) {
    const object = request.body.object;
    var name: string = object.metadata.name;
    var namespace: string = object.metadata.namespace;
    var spec: any = object.spec;
    var repo = getRepo(request);
    var latestCommit = repo.status.latestCommit;
    var kind: string = request.body.object.kind;
    var controller: string = request.body.controller.metadata.name;

    var triggerJob = needBuild(object, repo);

    var attachments = [
      manifestBuilderRole({
        name,
        namespace,
        targetNamespace: spec.targetNamespace
      }),
      manifestBuilderRoleBinding({
        name,
        gitRepositoryName: spec.gitRepository,
        namespace,
        targetNamespace: spec.targetNamespace
      }),
    ];

    const builderJob = manifestBuilderJob({
      object,
      repo,
      imagePrefix: settings.imagePrefix(),
      buildNumber: settings.buildNumber(),
      type: `${type}-manifests`,
      kind,
      controller,
      metricName: `${metricName}ManifestsBuilder`,
      metricLabels: { "namespace": namespace, [`${metricLabel}_manifests`]: name },
      containers: [
        {
          "image": `${settings.imagePrefix()}${type}-manifest-builder:${settings.buildNumber()}`,
          "args": [],
          "stdin": true,
          "tty": true,
          "env": [
            {
              "name": "SRC_PATH",
              "value": spec.path
            },
            {
              "name": "KIND",
              "value": kind
            },
            {
              "name": "CONTROLLER",
              "value": controller
            },
            ...(Object.entries(env).map(entry => ({
              "name": entry[0],
              "value": entry[1]
            })))
          ],
          "volumeMounts": [
            {
              "name": "git-temp",
              "mountPath": "/gitTemp",
              "readOnly": true
            }
          ],
          "name": `${type}-manifest-builder`,
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
      ]
    });

    var res = {
      "attachments": [
        ...attachments,
        ...(triggerJob ? [builderJob] : [])
      ],
      "status": (triggerJob ? {
        "conditions": [
          {
            "type": "Synced",
            "status": "False",
          },
        ],
      } : null)
    };

    if (triggerJob) {
      addMetric(`${metricName}ManifestsBuildTrigger`, { 'namespace': namespace, [`${metricLabel}_manifests`]: name, 'commit': latestCommit });
    }

    if (settings.debug()) console.log(`${metricName}Manifests sync res (${debugId(request)})`, JSON.stringify(res));
    response.status(200).json(res);
  },

  async customize(metricName: string, request: Request, response: Response, relatedResources: any[] = []) {
    var res = {
      "relatedResources": [
        {
          "apiVersion": "jabos.io/v1",
          "resource": "git-repositories",
          "namespace": request.body.parent.metadata.namespace,
          "names": [
            request.body.parent.spec.gitRepository
          ]
        },
        ...relatedResources
      ]
    };

    if (settings.debug()) console.log(`${metricName}Manifests customize res (${debugId(request)})`, JSON.stringify(res));
    response.status(200).json(res);
  },

  async finalize(metricName: string, request: Request, response: Response) {
    var name: string = request.body.object.metadata.name;
    var uid: string = request.body.object.metadata.uid;
    var namespace: string = request.body.object.metadata.namespace;
    var spec: any = request.body.object.spec;
    var manifests: string = request.body.object.metadata.annotations.deployedManifest;
    var kind: string = request.body.object.kind;
    var controller: string = request.body.controller.metadata.name;

    var jobName = `manifest-clean-${name}`;

    var jobs: any[] = Object.values(request.body.attachments['Job.batch/v1']).filter((job: any) => !!job.metadata.labels && !!job.metadata.labels.type && job.metadata.labels.type === 'manifest-cleaner');

    var finalized = (spec.cleanupPolicy === "Leave") || ((jobs.length > 0) && (jobs[0].status.succeeded === 1));

    var res = {
      "annotations": {},
      "attachments": finalized ? [] : [
        {
          "apiVersion": "rbac.authorization.k8s.io/v1",
          "kind": "Role",
          "metadata": {
            "name": `cleaner-${name}`,
            "namespace": spec.targetNamespace,
          },
          "rules": [
            {
              "apiGroups": ["*"],
              "resources": ["*"],
              "verbs": ["delete"],
            }
          ],
        },
        {
          "apiVersion": "rbac.authorization.k8s.io/v1",
          "kind": "RoleBinding",
          "metadata": {
            "name": `cleaner-${name}`,
            "namespace": spec.targetNamespace,
          },
          "roleRef": {
            "apiGroup": "rbac.authorization.k8s.io",
            "kind": "Role",
            "name": `cleaner-${name}`,
          },
          "subjects": [
            {
              "kind": "ServiceAccount",
              "namespace": spec.targetNamespace,
              "name": `cleaner-${name}`,
            }
          ],
        },
        {
          "apiVersion": 'v1',
          "kind": 'ServiceAccount',
          "metadata": {
            "name": `cleaner-${name}`,
            "namespace": spec.targetNamespace,
          },
        },
        {
          "apiVersion": "batch/v1",
          "kind": "Job",
          "metadata": {
            "name": jobName,
            "labels": {
              "type": "manifest-cleaner"
            }
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
                },
                annotations: {
                  "manifests": manifests
                }
              },
              "spec": {
                "serviceAccountName": `cleaner-${name}`,
                "restartPolicy": "Never",
                "securityContext": {
                  "runAsNonRoot": true,
                },
                "containers": [
                  {
                    "image": `${settings.imagePrefix()}manifest-cleaner:${settings.buildNumber()}`,
                    "args": [],
                    "stdin": true,
                    "tty": true,
                    "env": [
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
                        "name": "KIND",
                        "value": kind
                      },
                      {
                        "name": "CONTROLLER",
                        "value": controller
                      },
                      ...jabosOperatorUrlEnv()],
                    "imagePullPolicy": settings.imagePullPolicy(),
                    "securityContext": {
                      "readOnlyRootFilesystem": true,
                      "allowPrivilegeEscalation": false,
                      "runAsNonRoot": true,
                      "capabilities": {
                        "drop": ['ALL'],
                      },
                    },
                    "name": "manifest-cleaner",
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
                        "name": "manifests",
                        "mountPath": "/manifests",
                      },
                      {
                        "name": "temp",
                        "mountPath": "/tmp",
                      },
                    ]
                  }
                ],
                "volumes": [
                  {
                    "name": "temp",
                    "emptyDir": {}
                  },
                  {
                    "name": "manifests",
                    "downwardAPI": {
                      "items": [
                        {
                          "path": "manifests.tar.gz.b64",
                          "fieldRef": {
                            "fieldPath": "metadata.annotations['manifests']"
                          }
                        }
                      ]
                    }
                  },
                ]
              }
            }
          }
        }
      ],
      "finalized": finalized,
    }

    if (settings.debug()) console.log(`${metricName}Manifests finalize res (${debugId(request)})`, JSON.stringify(res));
    response.status(200).json(res);
  }
}
