function(imagePrefix, buildNumber, namespace, isProduction) (
  local manifests = (import './manifests.libsonnet');
  manifests.Controller(namespace=namespace, name='jsonnet')
)
