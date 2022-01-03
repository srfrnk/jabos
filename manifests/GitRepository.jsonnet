function(imagePrefix, buildNumber, namespace, isProduction) (
  local kube = import './kube.libsonnet';
  kube.CRD(kind='GitRepository',
           singular='git-repository',
           plural='git-repositories',
           group='jabos.io',
           shortNames=['repo'],
           versions=[
             {
               name: 'v1',
               served: true,
               storage: true,
               schema: {
                 openAPIV3Schema: {
                   type: 'object',
                   description: '`GitRepository` objects define a git codebase and how to pull from it.',
                   required: ['spec'],
                   properties: {
                     spec: {
                       type: 'object',
                       required: ['url', 'branch'],
                       properties: {
                         url: {
                           type: 'string',
                           description: 'The URL to use to access the git repository.',
                         },
                         branch: {
                           type: 'string',
                           description: 'The name of the branch to watch and pull from.',
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
                     },
                     status: {
                       type: 'object',
                       description: 'Status of object',
                       properties: {
                         conditions: {
                           type: 'array',
                           default: [],
                           description: 'List of conditions',
                           items: {
                             type: 'object',
                             description: 'Condition',
                             required: ['type', 'status'],
                             properties: {
                               type: {
                                 type: 'string',
                                 description: 'Type of condition',
                               },
                               status: {
                                 type: 'string',
                                 description: 'Status of the condition, one of **True**, **False**, **Unknown**',
                                 enum: ['True', 'False', 'Unknown'],
                               },
                               reason: {
                                 type: 'string',
                                 description: "One-word CamelCase reason for the condition's last transition",
                               },
                               message: {
                                 type: 'string',
                                 description: 'Human-readable message indicating details about last transition',
                               },
                               lastHeartbeatTime: {
                                 type: 'string',
                                 description: 'Last time we got an update on a given condition',
                               },
                               lastTransitionTime: {
                                 type: 'string',
                                 description: 'Last time the condition transit from one status to another',
                               },
                             },
                           },
                         },
                         latestCommit: {
                           type: 'string',
                           description: 'Latest Git Commit ID',
                         },
                       },
                     },
                   },
                 },
               },
               subresources: {
                 status: {},
               },
             },
           ])
)
