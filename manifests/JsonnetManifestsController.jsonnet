function(imagePrefix, buildNumber, namespace, debug) (
  local kube = import './kube.libsonnet';
  local metacontroller = import './metacontroller.libsonnet';
  metacontroller.DecoratorController(name='jsonnet-manifests-controller',
                                     resources=[
                                       {
                                         apiVersion: 'jabos.io/v1',
                                         resource: 'jsonnet-manifests',
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
                                     ],
                                     syncHook={
                                       webhook: {
                                         url: 'http://operator.' + namespace + ':3000/jsonnet-manifests-sync',
                                         timeout: '10s',
                                       },
                                     },
                                     customize={
                                       webhook: {
                                         url: 'http://operator.' + namespace + ':3000/jsonnet-manifests-customize',
                                         timeout: '10s',
                                       },
                                     },
                                     resyncPeriodSeconds=30)
)
