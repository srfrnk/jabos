import { Construct } from 'constructs';
import Manifests from './manifests';

export default class Cdk8sManifests extends Manifests {
  constructor(scope: Construct) {
    super(scope, 'Cdk8s', {
      kind: 'Cdk8s',
      singular: 'cdk8s',
      shortNames: ['cdk8s'],
      schema: {
        description: '`Cdk8sManifest` objects define a folder with [Cdk8s](https://cdk8s.io/) based manifests to deploy.',
        properties: {
          spec: {
            required: [],
            properties: {
              commitEnvKey: {
                type: 'string',
                default: 'latestCommitHash',
                description: 'The name of the environment variable to use for injecting the latest git commit hash. The commit hash is used to tag generated images for example. See usage example below.',
              },
              env: {
                type: 'object',
                additionalProperties: true,
                default: {},
                description: 'Key-Values of environment variables to inject when building.',
              },
            }
          },
        }
      }
    });
  }
}
