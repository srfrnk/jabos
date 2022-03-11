import { EnvVar } from './imports/k8s';
import settings from './settings';

export default function (): EnvVar[] {
  return [
    {
      name: "JABOS_OPERATOR_URL",
      value: `http://operator.${settings.namespace()}:${settings.port()}/`
    },
  ]
}