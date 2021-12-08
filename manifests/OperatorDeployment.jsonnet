function(imagePrefix, buildNumber, namespace, debug) (
  local kube = import './kube.libsonnet';
  local globals = import './globals.libsonnet';
  kube.Deployment(
    namespace=namespace,
    name='operator',
    replicas=1,
    serviceAccountName='operator',
    containers=[
      kube.Container(name='operator', image=imagePrefix + 'operator:' + buildNumber) +
      {
        env+: [
          {
            name: 'PORT',
            value: std.toString(globals.operatorPort),
          },
          {
            name: 'IMAGE_PREFIX',
            value: imagePrefix,
          },
          {
            name: 'BUILD_NUMBER',
            value: buildNumber,
          },
          {
            name: 'DEBUG',
            value: debug,
          },
          {
            name: 'PROMETHEUS_METRIC_PREFIX',
            value: globals.prometheusMetricPrefix,
          },
          {
            name: 'JOB_ACTIVE_DEADLINE_SECONDS',
            value: std.toString(globals.jobActiveDeadlineSeconds),
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
        ports+: [
          {
            name: 'web',
            protocol: 'TCP',
            containerPort: globals.operatorPort,
          },
        ],
        livenessProbe+: {
          httpGet: {
            path: '/',
            port: 'web',
          },
        },
        readinessProbe+: {
          httpGet: {
            path: '/',
            port: 'web',
          },
        },
        resources+: {
          requests+: {
            cpu: '100m',
            memory: '100Mi',
          },
          limits+: {
            cpu: '500m',
            memory: '500Mi',
          },
        },
      },
    ],
  )
)