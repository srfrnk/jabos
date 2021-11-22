function(imagePrefix, buildNumber, namespace, debug) (
  local kube = import './kube.libsonnet';
  local metacontroller = import './metacontroller.libsonnet';
  metacontroller.DecoratorController(namespace=namespace,
                                     name='plain-manifests-controller',
                                     resources=[
                                       {
                                         apiVersion: 'jabos.io/v1',
                                         resource: 'plain-manifests',
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
                                         url: 'http://operator.' + namespace + ':3000/plain-manifests-sync',
                                         timeout: '10s',
                                       },
                                     },
                                     customize={
                                       webhook: {
                                         url: 'http://operator.' + namespace + ':3000/plain-manifests-customize',
                                         timeout: '10s',
                                       },
                                     },
                                     resyncPeriodSeconds=30)
)
