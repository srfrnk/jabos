import settings from './settings';

export default function (): any[] {
  return [
    {
      "name": "JABOS_OPERATOR_URL",
      "value": `http://operator.${settings.namespace()}:${settings.port()}/`
    },
  ]
}