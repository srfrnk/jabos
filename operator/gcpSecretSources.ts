import { VolumeProjection } from './imports/k8s';

export default function (gcp: { secret: string, serviceAccountKey?: string }): VolumeProjection[] {
  return !gcp ? [] : [
    {
      "secret": {
        "name": gcp.secret,
        "items": [
          {
            "key": gcp.serviceAccountKey,
            "path": "gcp_service_account.json"
          }
        ]
      }
    }
  ]
}
