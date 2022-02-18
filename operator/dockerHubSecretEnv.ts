import { EnvVar } from './imports/k8s';

export default function (dockerHub): EnvVar[] {
  return !dockerHub ? [] : [
    {
      name: "DOCKER_HUB_USERNAME",
      valueFrom: {
        secretKeyRef: {
          name: dockerHub.secret,
          key: dockerHub.username
        }
      }
    },
    {
      name: "DOCKER_HUB_PASSWORD",
      valueFrom: {
        secretKeyRef: {
          name: dockerHub.secret,
          key: dockerHub.password
        }
      }
    }
  ];
}
