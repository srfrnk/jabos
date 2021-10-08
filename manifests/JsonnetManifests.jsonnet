function(imagePrefix, buildNumber, namespace, debug) (
  local manifests = (import './manifests.libsonnet').Manifests;
  manifests(kind='JsonnetManifest', singular='jsonnet-manifest', plural='jsonnet-manifests', shortNames=['jsonnet'])
)
