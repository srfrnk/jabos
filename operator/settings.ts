export default {
  namespace: (): string => process.env.NAMESPACE,
  port: (): string => process.env.PORT,
  imagePrefix: (): string => process.env.IMAGE_PREFIX,
  buildNumber: (): string => process.env.BUILD_NUMBER,
  debug: (): boolean => process.env.DEBUG == 'true',
  prometheusMetricPrefix: (): string => process.env.PROMETHEUS_METRIC_PREFIX,
  jobActiveDeadlineSeconds: (): string => process.env.JOB_ACTIVE_DEADLINE_SECONDS,
}
