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
                         },
                         branch: {
                           type: 'string',
                         },
                         ssh: {
                           type: 'object',
                           properties: {
                             secret: {
                               type: 'string',
                             },
                             passphrase: {
                               type: 'string',
                               default: 'passphrase',
                             },
                             key: {
                               type: 'string',
                               default: 'key',
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
