export default {
  namespace: (): string => process.env.NAMESPACE,
  imagePrefix: (): string => process.env.IMAGE_PREFIX,
  buildNumber: (): string => process.env.BUILD_NUMBER,
  debug: (): boolean => process.env.DEBUG == 'true',
}
