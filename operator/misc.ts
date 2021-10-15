export function k8sName(prefix: string, commit: string): string {
  return `${prefix.substring(0, 52)}-${commit}`.substring(0, 62);
}
