{
  Manifests(description, kind, singular, plural, shortNames=[], required=[], specProperties={}):: (
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
                     description: description,
                     required: ['spec'],
                     properties: {
                       spec: {
                         type: 'object',
                         required: ['gitRepository', 'targetNamespace'] + required,
                         properties: {
                           gitRepository: {
                             type: 'string',
                             description: 'The name of a `GitRepository` object which defines the codebase for the manifests. **Must be in the same namespace**.',
                           },
                           path: {
                             type: 'string',
                             default: '.',
                             description: 'The folder path **relative to the git repository root** where the jsonnet manifests are found. Default: "." (Repository root)',
                           },
                           targetNamespace: {
                             type: 'string',
                             description: 'The namespace into which deployment should be made. **Important Note: Due to a limitation with [Metacontroller](https://github.com/metacontroller/metacontroller) this has to be the same namespace as this object is put into.**',
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
