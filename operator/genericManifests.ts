import { Response } from 'express';

import settings from './settings';
import newManifestBuilderJob from './manifestBuilderJob';
import { addMetric } from './metrics';
import { debugId, useExistingJob, getRepo, needNewBuild } from './misc';
import jabosOperatorUrlEnv from './jabosOperatorUrlEnv';
import { BaseRequest, CustomizeRequest, CustomizeResponse, CustomizeResponseRelatedResource, FinalizeRequest, FinalizeResponse, SyncRequest, SyncResponse } from './metaControllerHooks';
import { ApiObjectProps, App, Chart } from 'cdk8s';
import { KubeJob, KubeRole, KubeRoleBinding, KubeServiceAccount, Quantity } from './imports/k8s';

export default {
  debugRequest(typeName: string, typeFunc: string, request: BaseRequest): void {
    if (settings.debug()) {
      console.log(`${typeName}Manifests ${typeFunc} req (${debugId(request)})`, JSON.stringify(request))
    }
  },

  async sync(metricName: string, type: string, metricLabel: string, env: { [key: string]: string }, request: SyncRequest, response: Response) {
    const object = request.object;
    const name: string = object.metadata.name;
    const namespace: string = object.metadata.namespace;
    const spec: any = object.spec;
    const repo = getRepo(request);
    const latestCommit = repo.status.latestCommit;
    const kind: string = request.object.kind;
    const controller: string = request.controller.metadata.name;

    const triggerJob = needNewBuild(request);

    const attachments = new Chart(new App(), 'attachments');

    const role = new KubeRole(attachments, `deployer-${name}`, {
      metadata: {
        name: `deployer-${name}`,
        namespace: spec.targetNamespace,
      },
      rules: [
        {
          apiGroups: ["*"],
          resources: ["*"],
          verbs: ["get", "list", "watch", "create", "update", "patch"],
        }
      ],
    })

    const roleBinding = new KubeRoleBinding(attachments, '', {
      "metadata": {
        "name": `deployer-${name}`,
        "namespace": spec.targetNamespace,
      },
      "roleRef": {
        "apiGroup": "rbac.authorization.k8s.io",
        "kind": "Role",
        "name": role.metadata.name,
      },
      "subjects": [
        {
          "kind": "ServiceAccount",
          "namespace": namespace,
          "name": `builder-${spec.gitRepository}`,
        }
      ],
    });
    roleBinding.addDependency(role);

    if (triggerJob) {
      newManifestBuilderJob({
        roleBinding: roleBinding,
        chart: attachments,
        object,
        repo,
        imagePrefix: settings.imagePrefix(),
        buildNumber: settings.buildNumber(),
        type: `${type}-manifests`,
        kind,
        controller,
        metricName: `${metricName}ManifestsBuilder`,
        metricLabels: { namespace: namespace, [`${metricLabel}_manifests`]: name },
        containers: [
          {
            image: `${settings.imagePrefix()}${type}-manifest-builder:${settings.buildNumber()}`,
            args: [],
            stdin: true,
            tty: true,
            env: [
              {
                name: "SRC_PATH",
                value: spec.path
              },
              {
                name: "KIND",
                value: kind
              },
              {
                name: "CONTROLLER",
                value: controller
              },
              ...(Object.entries(env).map(entry => ({
                name: entry[0],
                value: entry[1]
              })))
            ],
            volumeMounts: [
              {
                name: "git-temp",
                mountPath: "/gitTemp",
                readOnly: true
              }
            ],
            name: `${type}-manifest-builder`,
            resources: {
              limits: {
                cpu: Quantity.fromString("500m"),
                memory: Quantity.fromString("500Mi")
              },
              requests: {
                cpu: Quantity.fromString("100m"),
                memory: Quantity.fromString("100Mi")
              }
            },
          }
        ]
      });
    }
    else {
      useExistingJob(attachments, request);
    }

    const res = new SyncResponse({
      attachments: attachments,
      ...(triggerJob && {
        status: {
          conditions: [
            {
              type: "Synced",
              status: "False",
            },
          ],
        }
      })
    });

    if (triggerJob) {
      addMetric(`${metricName}ManifestsBuildTrigger`, { 'namespace': namespace, [`${metricLabel}_manifests`]: name, 'commit': latestCommit });
    }

    if (settings.debug()) console.log(`${metricName}Manifests sync res (${debugId(request.object)})`, JSON.stringify(res.toJson()));
    response.status(200).json(res.toJson());
  },

  async customize(metricName: string, request: CustomizeRequest, response: Response, relatedResources: CustomizeResponseRelatedResource[] = []) {
    const res = new CustomizeResponse({
      relatedResources: [
        {
          apiVersion: "jabos.io/v1",
          resource: "git-repositories",
          namespace: request.parent.metadata.namespace,
          names: [
            request.parent.spec.gitRepository
          ]
        },
        ...relatedResources
      ]
    });

    if (settings.debug()) console.log(`${metricName}Manifests customize res (${debugId(request.parent)})`, JSON.stringify(res.toJson()));
    response.status(200).json(res.toJson());
  },

  async finalize(metricName: string, request: FinalizeRequest, response: Response) {
    const name: string = request.object.metadata.name;
    const uid: string = request.object.metadata.uid;
    const namespace: string = request.object.metadata.namespace;
    const spec: any = request.object.spec;
    const manifests: string = request.object.metadata.annotations.deployedManifest;
    const kind: string = request.object.kind;
    const controller: string = request.controller.metadata.name;

    const jobName = `manifest-clean-${name}`;

    const jobs: any[] = Object.values((request.attachments || {})['Job.batch/v1'] || []).filter((job: any) => job?.metadata?.labels?.type === 'manifest-cleaner');

    const finalized = (spec.cleanupPolicy === "Leave") || ((jobs.length > 0) && (jobs[0].status.succeeded === 1));

    const attachments = new Chart(new App(), 'attachments');

    if (finalized) {

      const role = new KubeRole(attachments, `cleaner-${name}`, {
        metadata: {
          name: `cleaner-${name}`,
          namespace: spec.targetNamespace,
        },
        rules: [
          {
            apiGroups: ["*"],
            resources: ["*"],
            verbs: ["delete"],
          }
        ]
      });

      const serviceAccount = new KubeServiceAccount(attachments, `cleaner-${name}`, {
        metadata: {
          name: `cleaner-${name}`,
          namespace: spec.targetNamespace,
        },
      });

      const roleBinding = new KubeRoleBinding(attachments, `cleaner-${name}`, {
        metadata: {
          name: `cleaner-${name}`,
          namespace: spec.targetNamespace,
        },
        roleRef: {
          apiGroup: "rbac.authorization.k8s.io",
          kind: "Role",
          name: role.metadata.name,
        },
        subjects: [
          {
            kind: "ServiceAccount",
            namespace: spec.targetNamespace,
            name: serviceAccount.metadata.name,
          }
        ],
      });
      roleBinding.addDependency(role);
      roleBinding.addDependency(serviceAccount);

      const job = new KubeJob(attachments, '', {
        metadata: {
          name: jobName,
          labels: {
            type: "manifest-cleaner"
          }
        },
        spec: {
          completions: 1,
          completionMode: "NonIndexed",
          backoffLimit: parseInt(settings.jobBackoffLimit()),
          activeDeadlineSeconds: parseInt(settings.jobActiveDeadlineSeconds()),
          ttlSecondsAfterFinished: parseInt(settings.jobTtlSecondsAfterFinished()),
          parallelism: 1,
          template: {
            metadata: {
              name: jobName,
              labels: {
                builder: jobName
              },
              annotations: {
                manifests: manifests
              }
            },
            spec: {
              serviceAccountName: serviceAccount.metadata.name,
              restartPolicy: "Never",
              securityContext: {
                runAsNonRoot: true,
              },
              containers: [
                {
                  image: `${settings.imagePrefix()}manifest-cleaner:${settings.buildNumber()}`,
                  args: [],
                  stdin: true,
                  tty: true,
                  env: [
                    {
                      name: "NAMESPACE",
                      value: namespace
                    },
                    {
                      name: "NAME",
                      value: name
                    },
                    {
                      name: "OBJECT_UID",
                      value: uid
                    },
                    {
                      name: "KIND",
                      value: kind
                    },
                    {
                      name: "CONTROLLER",
                      value: controller
                    },
                    ...jabosOperatorUrlEnv()],
                  imagePullPolicy: settings.imagePullPolicy(),
                  securityContext: {
                    readOnlyRootFilesystem: true,
                    allowPrivilegeEscalation: false,
                    runAsNonRoot: true,
                    capabilities: {
                      drop: ['ALL'],
                    },
                  },
                  name: "manifest-cleaner",
                  resources: {
                    limits: {
                      cpu: Quantity.fromString("500m"),
                      memory: Quantity.fromString("500Mi")
                    },
                    requests: {
                      cpu: Quantity.fromString("100m"),
                      memory: Quantity.fromString("100Mi")
                    }
                  },
                  volumeMounts: [
                    {
                      name: "manifests",
                      mountPath: "/manifests",
                    },
                    {
                      name: "temp",
                      mountPath: "/tmp",
                    },
                  ]
                }
              ],
              volumes: [
                {
                  name: "temp",
                  emptyDir: {}
                },
                {
                  name: "manifests",
                  downwardApi: {
                    items: [
                      {
                        path: "manifests.tar.gz.b64",
                        fieldRef: {
                          fieldPath: "metadata.annotations['manifests']"
                        }
                      }
                    ]
                  }
                },
              ]
            }
          }
        }
      });

      job.addDependency(serviceAccount);
    }

    const res = new FinalizeResponse({
      annotations: {},
      attachments: attachments,
      finalized: finalized,
    });

    if (settings.debug()) console.log(`${metricName}Manifests finalize res (${debugId(request.object)})`, JSON.stringify(res.toJson()));
    response.status(200).json(res.toJson());
  }
}
