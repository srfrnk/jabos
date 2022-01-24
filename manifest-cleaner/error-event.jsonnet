function(kind, controller, name, namespace, uid, errorMessage, eventTime) (
  local events = import './events.libsonnet';
  events.SimpleEvent(
    eventName=name + '-manifest-cleaner-error',
    name=name,
    namespace=namespace,
    apiVersion='jabos.io/v1',
    kind=kind,
    uid=uid,
    action='ManifestClean',
    reason='ManifestCleanError',
    type='Warning',
    note=errorMessage,
    controller=controller,
    eventTime=eventTime,
  )
)
