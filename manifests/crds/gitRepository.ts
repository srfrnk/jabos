import { Construct } from 'constructs';
import { JabosCRD } from './crd';

export default class GitRepository extends JabosCRD {
  constructor(scope: Construct) {
    super(scope, 'GitRepository', {
      kind: 'GitRepository',
      plural: 'git-repositories',
      singular: 'git-repository',
      shortNames: ['repo'],
      schema: {
        type: 'object',
        description: '`GitRepository` objects define a git codebase and how to pull from it.',
        required: ['spec'],
        properties: {
          spec: {
            type: 'object',
            required: ['url'],
            properties: {
              url: {
                type: 'string',
                description: 'The URL to use to access the git repository.',
              },
              branch: {
                type: 'string',
                description: 'The name of the branch to watch and pull from.',
              },
              promotedCommit: {
                type: 'string',
                description: 'The `git` commit id to sync to.',
              },
              ssh: {
                type: 'object',
                description: 'Credentials for `SSH` access',
                properties: {
                  secret: {
                    type: 'string',
                    description: 'Name of secret to use. **Must be in the same namespace**',
                  },
                  passphrase: {
                    type: 'string',
                    default: 'git_ssh_passphrase',
                    description: 'Name of the key inside the secret to use for `SSH` passphrase.',
                  },
                  key: {
                    type: 'string',
                    default: 'git_ssh_key',
                    description: 'Name of the key inside the secret to use for `SSH` key.',
                  },
                },
              },
            },
            oneOf: [
              {
                required: [
                  'branch',
                ],
              },
              {
                required: [
                  'promotedCommit',
                ],
              },
            ],
          },
          status: {
            description: 'Will contains a condition of type "`Syncing`". If it becomes "`False`" an `Event` will describe the error.',
          },
        },
      },
      attachments: [
        {
          apiVersion: 'rbac.authorization.k8s.io/v1',
          resource: 'roles',
        },
        {
          apiVersion: 'rbac.authorization.k8s.io/v1',
          resource: 'rolebindings',
        },
        {
          apiVersion: 'v1',
          resource: 'serviceaccounts',
        }
      ]
    });
  }
}
