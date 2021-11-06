function(imagePrefix, buildNumber, namespace, debug) (
  local kube = import './kube.libsonnet';
  kube.CRD(isCluserScoped=false,
           kind='GitRepository',
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
                   properties: {
                     spec: {
                       type: 'object',
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
                           description: 'Credentials for ssh access',
                           properties: {
                             secret: {
                               type: 'string',
                               description: 'Name of secret to use. **Must be in the same namespace**',
                             },
                             passphrase: {
                               type: 'string',
                               default: 'git_ssh_passphrase',
                               description: 'Name of the key inside the secret to use for ssh passphrase. Default: "git_ssh_passphrase"',
                             },
                             key: {
                               type: 'string',
                               default: 'git_ssh_key',
                               description: 'Name of the key inside the secret to use for ssh key. Default: "git_ssh_key"',
                             },
                           },
                         },
                       },
                     },
                   },
                 },
               },
             },
           ])
)
