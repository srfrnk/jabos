function(name, namespace, uid, errorMessage, eventTime) (
  local events = import './events.libsonnet';
  events.SimpleEvent(
    eventName=name + '-build-error',
    name=name,
    namespace=namespace,
    apiVersion='jabos.io/v1',
    kind='DockerImage',
    uid=uid,
    action='KanikoBuild',
    reason='KanikoBuildError',
    type='Warning',
    note=errorMessage,
    controller='docker-images-controller',
    eventTime=eventTime,
  )
)
