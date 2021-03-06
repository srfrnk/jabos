import { VolumeProjection } from './imports/k8s';

export default function (aws: { secret: string, accessKeyId?: string, secretAccessKey?: string }): VolumeProjection[] {
  return !aws ? [] : [
    {
      "secret": {
        "name": aws.secret,
        "items": [
          {
            "key": aws.accessKeyId,
            "path": "aws_access_key_id"
          },
          {
            "key": aws.secretAccessKey,
            "path": "aws_secret_access_key"
          }
        ]
      }
    }
  ]
}
