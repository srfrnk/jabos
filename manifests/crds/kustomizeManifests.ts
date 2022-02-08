import { Construct } from 'constructs';
import Manifests from './manifests';

export default class KustomizeManifests extends Manifests {
  constructor(scope: Construct) {
    super(scope, 'Kustomize', {
      kind: 'Kustomize',
      singular: 'kustomize',
      shortNames: ['kustomize'],
      schema: {
        description: '`KustomizeManifest` objects define a folder with [Kustomize](https://kustomize.io/) based manifests to deploy.',
        properties: {
          spec: {
            required: [],
            properties: {
              dockerImages: {
                type: 'array',
                default: [],
                description: 'List of `DockerImage` objects to update tags built for. **Must be in the same namespace**',
                items: {
                  type: 'string',
                  description: 'Name `DockerImage` object. **Must be in the same namespace**',
                },
              },
              replacementPrefix: {
                type: 'string',
                default: '\\$\\{',
                description: 'The string to prefix string replacements with. **This is a [sed](https://www.gnu.org/software/sed/manual/html_node/Regular-Expressions.html) search expression and must be escaped accordingly.**',
              },
              replacementSuffix: {
                type: 'string',
                default: '\\}',
                description: 'The string to suffix string replacements with. **This is a [sed](https://www.gnu.org/software/sed/manual/html_node/Regular-Expressions.html) search expression and must be escaped accordingly.**',
              },
              replacements: {
                type: 'object',
                additionalProperties: true,
                default: {},
                description: 'Key-Values of replacements to make when building.',
              },
            }
          },
        }
      }
    });
  }
}
