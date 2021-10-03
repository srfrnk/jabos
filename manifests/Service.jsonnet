function(imagePrefix, buildNumber, namespace) (
  local kube = import './kube.libsonnet';
  local globals = import './globals.libsonnet';
  kube.HeadlessService(namespace=namespace, name='operator', selector={
    app: 'operator',
  }, ports=[{
    protocol: 'TCP',
    targetPort: globals.operatorPort,
    port: globals.operatorPort,
  }])
)
