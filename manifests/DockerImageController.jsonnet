function(imagePrefix, buildNumber, namespace) (
  local kube = import './kube.libsonnet';
  local metacontroller = import './metacontroller.libsonnet';
  metacontroller.DecoratorController(name='docker-images-controller',
                                     resources=[
                                       {
                                         apiVersion: 'jabos.io/v1',
                                         resource: 'docker-images',
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
                                         url: 'http://operator.' + namespace + ':3000/docker-images-sync',
                                         timeout: '10s',
                                       },
                                     },
                                     customize={
                                       webhook: {
                                         url: 'http://operator.' + namespace + ':3000/docker-images-customize',
                                         timeout: '10s',
                                       },
                                     },
                                     resyncPeriodSeconds=30)
)
