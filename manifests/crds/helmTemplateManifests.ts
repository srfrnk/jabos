import { Construct } from 'constructs';
import Manifests from './manifests';

export default class HelmTemplateManifests extends Manifests {
  constructor(scope: Construct) {
    super(scope, 'HelmTemplate', {
      kind: 'HelmTemplate',
      singular: 'helm-template',
      shortNames: [],
      schema: {
        description: '`HelmTemplateManifest` objects define a folder with a [helm](https://helm.sh/) chart to deploy with `helm template`.',
        properties: {
          spec: {
            required: [],
            properties: {
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
          },
        }
      }
    });
  }
}
