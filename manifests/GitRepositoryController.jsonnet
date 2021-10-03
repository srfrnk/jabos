function(imagePrefix, buildNumber, namespace) (
  local kube = import './kube.libsonnet';
  local metacontroller = import './metacontroller.libsonnet';
  metacontroller.DecoratorController(name='git-repositories-controller',
                                     resources=[
                                       {
                                         apiVersion: 'jabos.io/v1',
                                         resource: 'git-repositories',
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
                                     resyncPeriodSeconds=30)
)
