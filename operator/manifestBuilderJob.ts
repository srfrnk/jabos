import { ApiObjectProps } from 'cdk8s';
import builderJob from './builderJob';
import { Container, KubeJobProps, Quantity, Volume } from './imports/k8s';
import { GitRepositoryPropsEx } from './misc';
import settings from './settings';

export default function (options: {
  object: ApiObjectProps,
  repo: GitRepositoryPropsEx,
  imagePrefix: string,
  buildNumber: string,
  type: string,
  containers: Container[],
  volumes: Volume[],
  metricName: string,
  metricLabels: { [key: string]: string; },
  kind: string,
  controller: string
}): KubeJobProps {
  const containers = (options.containers || []).map(container => {
    return {
      ...container,
      volumeMounts: [
        ...(container.volumeMounts || []),
        {
          name: "manifests",
          mountPath: "/manifests",
        }
      ]
    };
  });

  const targetNamespace = options.object.spec.targetNamespace;

  return builderJob({
    object: options.object,
    repo: options.repo,
    jobNamePrefix: 'manifest',
    imagePrefix: settings.imagePrefix(),
    buildNumber: settings.buildNumber(),
    serviceAccountName: `builder-${options.object.spec.gitRepository}`,
    type: options.type,
    commitLabel: "deployedCommit",
    metricName: options.metricName,
    metricLabels: options.metricLabels,
    labels: { type: "manifest-builder", "manifest-builder-type": options.type },
    containers: [
      ...containers,
      {
        image: `${options.imagePrefix}manifest-deployer:${options.buildNumber}`,
        args: [targetNamespace, options.type, options.object.metadata.name],
        stdin: true,
        tty: true,
        env: [
          {
            name: "NAMESPACE",
            value: options.object.metadata.namespace
          },
          {
            name: "TARGET_NAMESPACE",
            value: targetNamespace
          },
          {
            name: "TYPE",
            value: options.type
          },
          {
            name: "NAME",
            value: options.object.metadata.name
          },
          {
            name: "KIND",
            value: options.kind
          },
          {
            name: "CONTROLLER",
            value: options.controller
          },
        ],
        name: "manifest-deployer",
        volumeMounts: [
          {
            name: "manifests",
            mountPath: "/manifests",
            readOnly: true
          }
        ],
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
      ...options.volumes,
      {
        name: "manifests",
        emptyDir: {}
      }
    ]
  });
}