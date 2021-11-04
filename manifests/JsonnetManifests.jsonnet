function(imagePrefix, buildNumber, namespace, debug) (
  local manifests = (import './manifests.libsonnet').Manifests;
  manifests(kind='JsonnetManifest',
            singular='jsonnet-manifest',
            plural='jsonnet-manifests',
            shortNames=['jsonnet'],
            specProperties={
              commitTLAKey: {
                type: 'string',
                default: 'latestCommitHash',
                description: 'The name of a [Top-Level Argument (TLA)](https://jsonnet.org/ref/language.html#top-level-arguments-tlas) to use for injecting the latest git commit hash. The commit hash is used to tag generated images for example. See usage example below. Default: "latestCommitHash"',
              },
            })
)
