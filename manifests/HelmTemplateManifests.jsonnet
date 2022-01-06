function(imagePrefix, buildNumber, namespace, isProduction) (
  local manifests = (import './manifests.libsonnet');
  manifests.CRD(
    description='`HelmTemplateManifest` objects define a folder with a [helm](https://helm.sh/) chart to deploy with `helm template`.',
    kind='HelmTemplateManifest',
    singular='helm-template-manifest',
    plural='helm-template-manifests',
    shortNames=[],
    required=[],
    specProperties={
      commitValueKey: {
        type: 'string',
        default: 'LATEST_COMMIT_HASH',
        description: 'The key of the value to to set with the commit hash for the build. **Will be used as a Helm command line `--set-string` argument. Must be escaped accordingly.**',
      },
      values: {
        type: 'object',
        additionalProperties: true,
        default: {},
        description: 'Key-Values to inject when building.',
      },
    }
  )
)
