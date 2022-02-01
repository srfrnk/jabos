function(imagePrefix, buildNumber, namespace, isProduction) (
  local kube = import './kube.libsonnet';
  local globals = import './globals.libsonnet';
  kube.Deployment(
    namespace=namespace,
    name='operator',
    replicas=1,
    serviceAccountName='operator',
    containers=[
      kube.Container(name='operator', image=imagePrefix + 'operator:' + buildNumber, imagePullPolicy=(if isProduction == 'true' then 'Always' else 'IfNotPresent')) +
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
            name: 'IS_PRODUCTION',
            value: isProduction,
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
            name: 'JOB_BACKOFF_LIMIT',
            value: std.toString(globals.jobBackoffLimit),
          },
          {
            name: 'JOB_TTL_SECONDS_AFTER_FINISHED',
            value: std.toString(globals.jobTtlSecondsAfterFinished),
          },
          {
            name: 'EXPRESS_JSON_REQUEST_PAYLOAD_LIMIT',
            value: std.toString(globals.expressJsonRequestPayloadLimit),
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
