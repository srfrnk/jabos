function(imagePrefix, buildNumber, namespace, isProduction) (
  local kube = import './kube.libsonnet';
  local globals = import './globals.libsonnet';
  kube.ServiceAccount(namespace=namespace, name='operator')
)
