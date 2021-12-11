function(imagePrefix, buildNumber, namespace, isProduction) (
  local kube = import './kube.libsonnet';
  local metacontroller = import './metacontroller.libsonnet';
  metacontroller.DecoratorController(namespace=namespace,
                                     name='git-repositories-controller',
                                     resources=[
                                       {
                                         apiVersion: 'jabos.io/v1',
                                         resource: 'git-repositories',
                                       },
                                     ],
                                     attachments=[
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
                                       },
                                       {
                                         apiVersion: 'batch/v1',
                                         resource: 'jobs',
                                         updateStrategy: {
                                           method: 'InPlace',
                                         },
                                       },
                                     ],
                                     syncHook={
                                       webhook: {
                                         url: 'http://operator.' + namespace + ':3000/git-repositories-sync',
                                         timeout: '10s',
                                       },
                                     },
                                     customize={
                                       webhook: {
                                         url: 'http://operator.' + namespace + ':3000/git-repositories-customize',
                                         timeout: '10s',
                                       },
                                     },
                                     finalize={
                                       webhook: {
                                         url: 'http://operator.' + namespace + ':3000/git-repositories-finalize',
                                         timeout: '10s',
                                       },
                                     },
                                     resyncPeriodSeconds=30)
)
