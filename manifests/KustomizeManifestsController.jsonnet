function(imagePrefix, buildNumber, namespace, debug) (
  local manifests = (import './manifests.libsonnet');
  manifests.Controller(namespace=namespace, name='kustomize')
)
