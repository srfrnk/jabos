{
  Manifests(kind, singular, plural, shortNames=[], specProperties={}):: (
    local kube = import './kube.libsonnet';
    kube.CRD(isCluserScoped=false,
             kind=kind,
             singular=singular,
             plural=plural,
             group='jabos.io',
             shortNames=shortNames,
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
                           gitRepository: {
                             type: 'string',
                           },
                           path: {
                             type: 'string',
                             default: '.',
                           },
                           targetNamespace: {
                             type: 'string',
                           },
                         } + specProperties,
                       },
                     },
                   },
                 },
               },
             ])
  ),
}
