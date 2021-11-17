function(imagePrefix, buildNumber, namespace, debug) (
  local kube = import './kube.libsonnet';
  local monitoring = import './monitoring.libsonnet';
  local globals = import './globals.libsonnet';

  [
    kube.Service(headless=true, namespace=namespace, name='operator', labels={
      app: 'operator',
    }, selector={
      app: 'operator',
    }, ports=[{
      protocol: 'TCP',
      targetPort: globals.operatorPort,
      port: globals.operatorPort,
      name: 'web',
    }]),
    monitoring.ServiceMonitor(namespace=namespace, name='operator', namespaceSelector={}, selector={
      matchLabels: {
        app: 'operator',
      },
    }, endpoints=[
      monitoring.Endpoint(port='web', path='/metrics', interval='30s', scheme='http'),
    ]),
  ]
)
