export default function (options: {
  jobName: string,
  imagePrefix: string,
  buildNumber: string,
  type: string,
  name: string,
  serviceAccountName: string,
  namespace: string,
  commit: string,
  containers: any[],
  volumes: any[]
}) {
  return {
    "apiVersion": "batch/v1",
    "kind": "Job",
    "metadata": {
      "name": options.jobName
    },
    "spec": {
      "completions": 1,
      "completionMode": "NonIndexed",
      "backoffLimit": 100,
      "activeDeadlineSeconds": 3600,
      "parallelism": 1,
      "template": {
        "metadata": {
          "name": options.jobName,
          "labels": {
            "builder": options.jobName
          }
        },
        "spec": {
          "serviceAccountName": options.serviceAccountName,
          "restartPolicy": "OnFailure",
          "initContainers": options.containers,
          "containers": [
            {
              "image": `${options.imagePrefix}post-builder:${options.buildNumber}`,
              "args": [options.type, options.name, options.namespace, options.commit],
              "imagePullPolicy": "IfNotPresent",
              "name": "post-builder",
              "resources": {
                "limits": {
                  "cpu": "500m",
                  "memory": "500Mi"
                },
                "requests": {
                  "cpu": "100m",
                  "memory": "100Mi"
                }
              },
            }
          ],
          "volumes": options.volumes
        }
      }
    }
  };
}