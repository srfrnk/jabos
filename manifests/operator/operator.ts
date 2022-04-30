import { Construct } from 'constructs';
import { IntOrString, KubeDeployment, KubeService, KubeServiceAccount, Quantity } from '../imports/k8s';
import settings from '../settings';
import container from '../container';
import { ServiceMonitor } from '../imports/monitoring.coreos.com';

export default class Operator extends Construct {
  constructor(scope: Construct) {
    super(scope, 'operator', {});

    const labels = {
      app: 'operator',
    };

    const serviceAccount = new KubeServiceAccount(this, 'OperatorServiceAccount', {
      metadata: {
        namespace: settings.jabosNamespace(),
        name: 'operator'
      }
    });


    new KubeService(this, "OperatorService", {
      metadata: {
        namespace: settings.jabosNamespace(),
        name: 'operator',
        labels: labels
      },
      spec: {
        selector: labels,
        ports: [{
          protocol: 'TCP',
          targetPort: IntOrString.fromNumber(settings.operatorPort()),
          port: settings.operatorPort(),
          name: 'web',
        }],
        clusterIp: 'None'
      }
    });

    new KubeDeployment(this, 'OperatorDeployment', {
      metadata: {
        namespace: settings.jabosNamespace(),
        name: 'operator',
        labels: labels
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: labels
        },
        template: {
          metadata: {
            name: 'operator',
            labels: labels,
            ...!settings.isProduction() && {
              annotations: {
                "k9scli.io/auto-port-forwards": `operator::${settings.debugPort()}:${settings.debugPort()}`
              }
            }
          },
          spec: {
            serviceAccountName: serviceAccount.metadata.name,
            securityContext: {
              runAsNonRoot: true
            },
            volumes: [],
            containers: [
              container('operator', {
                name: 'operator',
                env: [
                  {
                    name: 'PORT',
                    value: settings.operatorPort().toString(),
                  },
                  {
                    name: 'IMAGE_PREFIX',
                    value: settings.imagePrefix(),
                  },
                  {
                    name: 'BUILD_NUMBER',
                    value: settings.buildNumber(),
                  },
                  {
                    name: 'IS_PRODUCTION',
                    value: settings.isProduction().toString(),
                  },
                  {
                    name: 'DEBUG_PORT',
                    value: settings.debugPort().toString(),
                  },
                  {
                    name: 'PROMETHEUS_METRIC_PREFIX',
                    value: settings.prometheusMetricPrefix(),
                  },
                  {
                    name: 'JOB_ACTIVE_DEADLINE_SECONDS',
                    value: settings.jobActiveDeadlineSeconds().toString(),
                  },
                  {
                    name: 'JOB_BACKOFF_LIMIT',
                    value: settings.jobBackoffLimit().toString(),
                  },
                  {
                    name: 'JOB_TTL_SECONDS_AFTER_FINISHED',
                    value: settings.jobTtlSecondsAfterFinished().toString(),
                  },
                  {
                    name: 'EXPRESS_JSON_REQUEST_PAYLOAD_LIMIT',
                    value: settings.expressJsonRequestPayloadLimit(),
                  },
                  {
                    name: 'NAMESPACE',
                    valueFrom: {
                      fieldRef: {
                        fieldPath: 'metadata.namespace',
                      },
                    },
                  },
                ],
                ports: [
                  {
                    name: 'web',
                    protocol: 'TCP',
                    containerPort: settings.operatorPort(),
                  },
                ],
                livenessProbe: {
                  timeoutSeconds: settings.isProduction() ? 5 : 10e6,
                  httpGet: {
                    path: '/',
                    port: IntOrString.fromString('web'),
                  },
                },
                readinessProbe: {
                  timeoutSeconds: settings.isProduction() ? 5 : 10e6,
                  httpGet: {
                    path: '/',
                    port: IntOrString.fromString('web'),
                  },
                },
                resources: {
                  requests: {
                    cpu: Quantity.fromString('100m'),
                    memory: Quantity.fromString('100Mi'),
                  },
                  limits: {
                    cpu: Quantity.fromString('500m'),
                    memory: Quantity.fromString('500Mi'),
                  },
                }
              })
            ]
          }
        }
      }
    });

    new ServiceMonitor(this, 'OperatorServiceMonitor', {
      metadata: {
        namespace: settings.jabosNamespace(),
        name: 'operator'
      },
      spec: {
        namespaceSelector: {},
        selector: {
          matchLabels: labels
        },
        endpoints: [
          {
            port: 'web',
            path: '/metrics',
            interval: '30s',
            scheme: 'http'
          },
        ]
      }
    });
  }
}
