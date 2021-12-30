local events = import '../k8s-jsonnet-libs/events.libsonnet';
events.SimpleEvent(
  name='first-image',
  namespace='example-env-stg',
  apiVersion='jabos.io/v1',
  kind='DockerImage',
  resourceVersion='2268',
  uid='94bcd7fc-554b-45b6-921d-1ffea88f5741',
  action='my action',
  reason='my reason',
  type='Warning',
  note='my note',
  controller='my-controller',
  eventTime='2021-12-30T09:37:20.886561Z',
  count=1000
)
