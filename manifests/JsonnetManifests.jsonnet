function(imagePrefix, buildNumber, namespace, isProduction) (
  local manifests = (import './manifests.libsonnet');
  manifests.CRD(
    description='`JsonnetManifest` objects define a folder with [jsonnet](https://jsonnet.org/) based manifests to deploy.',
    kind='JsonnetManifest',
    singular='jsonnet-manifest',
    plural='jsonnet-manifests',
    shortNames=['jsonnet'],
    required=[],
    specProperties={
      commitTLAKey: {
        type: 'string',
        default: 'latestCommitHash',
        description: 'The name of a [Top-Level Argument (TLA)](https://jsonnet.org/ref/language.html#top-level-arguments-tlas) to use for injecting the latest git commit hash. The commit hash is used to tag generated images for example. See usage example below.',
      },
      tlas: {
        type: 'object',
        additionalProperties: true,
        default: {},
        description: 'Key-Values of [Top-Level Arguments (TLA)](https://jsonnet.org/ref/language.html#top-level-arguments-tlas) to injecting when building.',
      },
    }
  )
)
