import { Construct } from 'constructs';
import Manifests from './manifests';

export default class PlainManifests extends Manifests {
  constructor(scope: Construct) {
    super(scope, 'Plain', {
      kind: 'Plain',
      singular: 'plain',
      shortNames: ['plain'],
      schema: {
        description: '`PlainManifest` objects define a folder with plain manifests to deploy (YAML/YML/JSON).',
        properties: {
          spec: {
            required: [],
            properties: {
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
              commitReplacementString: {
                type: 'string',
                default: 'LATEST_COMMIT_HASH',
                description: 'The string to replace with the commit hash for the build. Will be prefixed by `replacementPrefix` and suffixed by `replacementSuffix`. **This is a [sed](https://www.gnu.org/software/sed/manual/html_node/Regular-Expressions.html) search expression and must be escaped accordingly.**',
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
