function(kind, controller, name, namespace, uid, errorMessage, eventTime) (
  local events = import './events.libsonnet';
  events.SimpleEvent(
    eventName=name + '-manifest-deployer-error',
    name=name,
    namespace=namespace,
    apiVersion='jabos.io/v1',
    kind=kind,
    uid=uid,
    action='ManifestDeploy',
    reason='ManifestDeployError',
    type='Warning',
    note=errorMessage,
    controller=controller,
    eventTime=eventTime,
  )
)
