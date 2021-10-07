function(imagePrefix, buildNumber, namespace, debug) (
  local kube = import './kube.libsonnet';
  local globals = import './globals.libsonnet';
  kube.Deployment(
    namespace=namespace,
    name='operator',
    replicas=1,
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
        ],
        volumeMounts+: [
          {
            name: 'dockersock',
            mountPath: '/var/run/docker.sock',
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
    volumes=[
      {
        name: 'dockersock',
        hostPath: {
          path: '/var/run/docker.sock',
        },
      },
    ],
  )
)
