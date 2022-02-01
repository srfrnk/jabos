export default {
  namespace: (): string => process.env.NAMESPACE,
  port: (): string => process.env.PORT,
  imagePrefix: (): string => process.env.IMAGE_PREFIX,
  buildNumber: (): string => process.env.BUILD_NUMBER,
  debug: (): boolean => process.env.IS_PRODUCTION !== 'true',
  imagePullPolicy: (): string => process.env.IS_PRODUCTION === 'true' ? 'Always' : 'IfNotPresent',
  prometheusMetricPrefix: (): string => process.env.PROMETHEUS_METRIC_PREFIX,
  jobActiveDeadlineSeconds: (): string => process.env.JOB_ACTIVE_DEADLINE_SECONDS,
  jobBackoffLimit: (): string => process.env.JOB_BACKOFF_LIMIT,
  jobTtlSecondsAfterFinished: (): string => process.env.JOB_TTL_SECONDS_AFTER_FINISHED,
  expressJsonRequestPayloadLimit: (): string => process.env.EXPRESS_JSON_REQUEST_PAYLOAD_LIMIT,
}
