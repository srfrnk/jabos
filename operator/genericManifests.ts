import { Request, Response, NextFunction } from 'express';

import settings from './settings';
import manifestBuilderJob from './manifestBuilderJob';
import manifestBuilderRole from './manifestBuilderRole';
import manifestBuilderRoleBinding from './manifestBuilderRoleBinding';
import { addMetric } from './metrics';
import { getRepo } from './misc';
import jabosOperatorUrlEnv from './jabosOperatorUrlEnv';

export default {
  async sync(metricName: string, type: string, metricLabel: string, args: string[], request: Request, response: Response) {
    if (settings.debug()) console.log(`${metricName}Manifests sync req`, JSON.stringify(request.body));

    var name: string = request.body.object.metadata.name;
    var namespace: string = request.body.object.metadata.namespace;
    var spec: any = request.body.object.spec;
    var builtCommit: string = (request.body.object.metadata.annotations || {}).builtCommit || '';
    var repo = getRepo(request);
    var latestCommit = (repo.status || {}).latestCommit;

    var triggerJob = (!!latestCommit && latestCommit !== builtCommit);

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
      imagePrefix: settings.imagePrefix(),
      buildNumber: settings.buildNumber(),
      commit: latestCommit,
      repoUrl: repo.spec.url,
      repoBranch: repo.spec.branch,
      repoSsh: repo.spec.ssh,
      name,
      namespace,
      gitRepository: spec.gitRepository,
      targetNamespace: spec.targetNamespace,
      type: `${type}-manifests`,
      metricName: `${metricName}ManifestsBuilder`,
      metricLabels: { "namespace": namespace, [`${metricLabel}_manifests`]: name },
      containers: [
        {
          "image": `${settings.imagePrefix()}${type}-manifest-builder:${settings.buildNumber()}`,
          "args": [spec.path, ...args],
          "env": [],
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
      "annotations": !latestCommit ? {} : {
        "latestCommit": latestCommit,
      },
      "attachments": [
        ...attachments,
        ...(triggerJob ? [builderJob] : [])
      ]
    };

    if (triggerJob) {
      addMetric(`${metricName}ManifestsBuildTrigger`, { 'namespace': namespace, [`${metricLabel}_manifests`]: name, 'commit': latestCommit });
    }

    if (settings.debug()) console.log(`${metricName}Manifests sync res`, JSON.stringify(res));
    response.status(200).json(res);
  },

  async customize(metricName: string, request: Request, response: Response, relatedResources: any[] = []) {
    if (settings.debug()) console.log(`${metricName}Manifests customize req`, JSON.stringify(request.body));

    var res = {
      "relatedResources": [
        {
          "apiVersion": "jabos.io/v1",
          "resource": "git-repositories",
          // "namespace": request.body.parent.metadata.namespace, // Removed due to https://github.com/metacontroller/metacontroller/issues/414
          "names": [
            request.body.parent.spec.gitRepository
          ]
        },
        ...relatedResources
      ]
    };

    if (settings.debug()) console.log(`${metricName}Manifests customize res`, JSON.stringify(res));
    response.status(200).json(res);
  },

  async finalize(metricName: string, request: Request, response: Response) {
    if (settings.debug()) console.log(`${metricName}Manifests finalize req`, JSON.stringify(request.body));

    var name: string = request.body.object.metadata.name;
    var namespace: string = request.body.object.metadata.namespace;
    var spec: any = request.body.object.spec;
    var manifests: string = request.body.object.metadata.annotations.deployedManifest;

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
                "restartPolicy": "OnFailure",
                "securityContext": {
                  "runAsNonRoot": true,
                },
                "containers": [
                  {
                    "image": `${settings.imagePrefix()}manifest-cleaner:${settings.buildNumber()}`,
                    "args": [namespace],
                    "env": jabosOperatorUrlEnv(),
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

    if (settings.debug()) console.log(`${metricName}Manifests finalize res`, JSON.stringify(res));
    response.status(200).json(res);
  }
}
