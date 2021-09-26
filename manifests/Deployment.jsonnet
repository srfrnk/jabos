function(imagePrefix, buildNumber) (
  local kube = import './kube.libsonnet';
  kube.Deployment('operator', 1, [
    kube.Container('operator', imagePrefix + 'operator:' + buildNumber) +
    {
      env+: [
        {
          name: 'PORT',
          value: '3000',
        },
      ],
      ports+: [
        {
          name: 'web',
          protocol: 'TCP',
          containerPort: 3000,
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
  ])
)
