function(name, namespace, uid, errorMessage, eventTime) (
  local events = import './events.libsonnet';
  events.SimpleEvent(
    eventName=name + '-git-pull-error',
    name=name,
    namespace=namespace,
    apiVersion='jabos.io/v1',
    kind='GitRepository',
    uid=uid,
    action='GitPull',
    reason='GitPullError',
    type='Warning',
    note=errorMessage,
    controller='git-repositories-controller',
    eventTime=eventTime,
  )
)
