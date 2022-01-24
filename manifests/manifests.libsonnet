{
  CRD(description, kind, singular, plural, shortNames=[], required=[], specProperties={}):: (
    local kube = import './kube.libsonnet';
    kube.CRD(kind=kind,
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
                             description: 'The folder path **relative to the git repository root** where the jsonnet manifests are found.',
                           },
                           targetNamespace: {
                             type: 'string',
                             description: 'The namespace into which deployment should be made. **Important Note: Due to a limitation with [Metacontroller](https://github.com/metacontroller/metacontroller) this has to be the same namespace as this object is put into.**',
                           },
                           cleanupPolicy: {
                             type: 'string',
                             description: 'The cleanup policy to use when object is deleted. **`Delete`** will delete all created objects. **`Leave`** will leave all object intact.',
                             enum: ['Delete', 'Leave'],
                             default: 'Leave',
                           },
                         } + specProperties,
                       },
                       status: {
                         description: 'Will contains a condition of type "`Synced`". If it becomes "`False`" an `Event` will describe the error.',
                         properties: {
                           latestCommit: {
                             type: 'string',
                             description: 'The latest `git` commit id found',
                           },
                           builtCommit: {
                             type: 'string',
                             description: 'The latest `git` commit id build',
                           },
                         },
                       },
                     },
                   },
                 },
               },
             ])
  ),
  Controller(namespace, name):: (
    local kube = import './kube.libsonnet';
    local metacontroller = import './metacontroller.libsonnet';
    metacontroller.DecoratorController(namespace=namespace,
                                       name=name + '-manifests-controller',
                                       resources=[
                                         {
                                           apiVersion: 'jabos.io/v1',
                                           resource: name + '-manifests',
                                         },
                                       ],
                                       attachments=[
                                         {
                                           apiVersion: 'batch/v1',
                                           resource: 'jobs',
                                           updateStrategy: {
                                             method: 'InPlace',
                                           },
                                         },
                                         {
                                           apiVersion: 'rbac.authorization.k8s.io/v1',
                                           resource: 'roles',
                                         },
                                         {
                                           apiVersion: 'rbac.authorization.k8s.io/v1',
                                           resource: 'rolebindings',
                                         },
                                       ],
                                       syncHook={
                                         webhook: {
                                           url: 'http://operator.' + namespace + ':3000/' + name + '-manifests-sync',
                                           timeout: '10s',
                                         },
                                       },
                                       customize={
                                         webhook: {
                                           url: 'http://operator.' + namespace + ':3000/' + name + '-manifests-customize',
                                           timeout: '10s',
                                         },
                                       },
                                       finalize={
                                         webhook: {
                                           url: 'http://operator.' + namespace + ':3000/' + name + '-manifests-finalize',
                                           timeout: '10s',
                                         },
                                       },
                                       resyncPeriodSeconds=30)

  ),
}
