import { ApiObjectProps, Chart } from 'cdk8s';
import { Container, EnvVar, KubeJob, KubeJobProps, Quantity, Volume } from './imports/k8s';
import jabosOperatorUrlEnv from './jabosOperatorUrlEnv';
import { GitRepositoryPropsEx, k8sName } from './misc';
import settings from './settings';

export default function (options: {
  object: ApiObjectProps,
  jobNamePrefix: string,
  imagePrefix: string,
  buildNumber: string,
  type: string,
  serviceAccountName: string,
  repo: GitRepositoryPropsEx,
  containers: Container[],
  volumes?: Volume[],
  metricName: string,
  metricLabels: { [key: string]: string; },
  labels: { [key: string]: string; },
  commitLabel: string
}): KubeJobProps {
  const latestCommit = options.repo.status.latestCommit;
  const jobName = k8sName(`${options.jobNamePrefix}-${options.object.metadata.name}`, latestCommit);
  const repoSsh = options.repo.spec.ssh;

  const initContainers: Container[] = (options.containers || []).map(container => {
    return {
      ...container,
      imagePullPolicy: settings.imagePullPolicy(),
      env: [
        ...(container.env || []),
        {
          name: "NAMESPACE",
          value: options.object.metadata.namespace
        },
        {
          name: "NAME",
          value: options.object.metadata.name
        },
        {
          name: "OBJECT_UID",
          value: options.object.metadata.uid
        },
      ],
      securityContext: {
        ...container.securityContext,
        readOnlyRootFilesystem: true,
        allowPrivilegeEscalation: false,
        runAsNonRoot: true,
        capabilities: {
          drop: ['ALL'],
        },
      },
      volumeMounts: [
        ...(container.volumeMounts || []),
        {
          name: "temp",
          mountPath: "/tmp",
        },
        {
          name: "build",
          mountPath: "/build",
        }
      ]
    };
  });

  const sshEnv: EnvVar[] = !repoSsh ? [] : [
    {
      name: "SSH_PASSPHRASE",
      valueFrom: {
        secretKeyRef: {
          name: repoSsh.secret,
          key: repoSsh.passphrase
        }
      }
    },
    {
      name: "SSH_KEY",
      valueFrom: {
        secretKeyRef: {
          name: repoSsh.secret,
          key: repoSsh.key,
        }
      }
    }
  ];

  return {
    metadata: {
      name: jobName,
      labels: options.labels
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
          }
        },
        spec: {
          serviceAccountName: options.serviceAccountName,
          restartPolicy: "Never",
          securityContext: {
            runAsNonRoot: true,
          },
          initContainers: [
            {
              image: `${settings.imagePrefix()}pre-builder:${settings.buildNumber()}`,
              args: [],
              env: [
                {
                  name: "URL",
                  value: options.repo.spec.url
                },
                {
                  name: "BRANCH",
                  value: options.repo.spec.branch
                },
                {
                  name: "COMMIT",
                  value: latestCommit
                },
                {
                  name: "METRIC_NAME",
                  value: options.metricName
                },
                {
                  name: "METRIC_LABELS",
                  value: JSON.stringify(options.metricLabels)
                },
                {
                  name: "NAMESPACE",
                  value: options.object.metadata.namespace
                },
                {
                  name: "NAME",
                  value: options.object.metadata.name
                },
                {
                  name: "OBJECT_UID",
                  value: options.object.metadata.uid
                },
                ...jabosOperatorUrlEnv(),
                ...sshEnv
              ],
              imagePullPolicy: settings.imagePullPolicy(),
              securityContext: {
                readOnlyRootFilesystem: true,
                allowPrivilegeEscalation: false,
                runAsNonRoot: true,
                capabilities: {
                  drop: ['ALL'],
                },
              },
              name: "pre-builder",
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
                  name: "git-temp",
                  mountPath: "/gitTemp",
                },
                {
                  name: "temp",
                  mountPath: "/tmp",
                },
                {
                  name: "timer",
                  mountPath: "/timer",
                }
              ]
            },
            ...initContainers
          ],
          containers: [
            {
              image: `${options.imagePrefix}post-builder:${options.buildNumber}`,
              args: [],
              env: [
                {
                  name: "TYPE",
                  value: options.type
                },
                {
                  name: "NAME",
                  value: options.object.metadata.name
                },
                {
                  name: "COMMIT",
                  value: latestCommit
                },
                {
                  name: "COMMIT_LABEL",
                  value: options.commitLabel
                },
                {
                  name: "METRIC_NAME",
                  value: options.metricName
                },
                {
                  name: "METRIC_LABELS",
                  value: JSON.stringify(options.metricLabels)
                },
                {
                  name: "NAMESPACE",
                  value: options.object.metadata.namespace
                },
                {
                  name: "OBJECT_UID",
                  value: options.object.metadata.uid
                },
                ...jabosOperatorUrlEnv()
              ],
              volumeMounts: [
                {
                  name: "timer",
                  mountPath: "/timer",
                  readOnly: true
                },
                {
                  name: "temp",
                  mountPath: "/tmp"
                }
              ],
              imagePullPolicy: settings.imagePullPolicy(),
              securityContext: {
                readOnlyRootFilesystem: true,
                allowPrivilegeEscalation: false,
                runAsNonRoot: true,
                capabilities: {
                  drop: ['ALL'],
                },
              },
              name: "post-builder",
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
          ],
          volumes: [
            ...(options.volumes || []),
            {
              name: "git-temp",
              emptyDir: {}
            },
            {
              name: "temp",
              emptyDir: {}
            },
            {
              name: "build",
              emptyDir: {}
            },
            {
              name: "timer",
              emptyDir: {}
            }
          ]
        }
      }
    }
  };
}