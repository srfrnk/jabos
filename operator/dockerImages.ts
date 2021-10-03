import { Request, Response, NextFunction } from 'express';
import settings from './settings';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    console.log("dockerImages sync req", JSON.stringify(request.body));

    var name = request.body.object.metadata.name;
    var spec = request.body.object.spec;
    var builtCommit = request.body.object.metadata.annotations.builtCommit;
    var repo: any = Object.values(request.body.related['GitRepository.jabos.io/v1'])[0];
    var latestCommit = repo.metadata.annotations.latestCommit;

    var jobName = `image-${name}-${latestCommit}`.substring(0, 62);
    var podLabel = `${name}-${latestCommit}`.substring(0, 62);

    var res = {
      "annotations": {
        "lastUpdate": new Date().toISOString(),
        "latestCommit": latestCommit,
      },
      "attachments": latestCommit == builtCommit ? [] : [
        {
          "apiVersion": "batch/v1",
          "kind": "Job",
          "metadata": {
            "name": jobName
          },
          "spec": {
            "completions": 1,
            "completionMode": "NonIndexed",
            "backoffLimit": 100,
            "activeDeadlineSeconds": 3600,
            "parallelism": 1,
            "template": {
              "metadata": {
                "name": jobName,
                "labels": {
                  "docker-image-build": podLabel
                }
              },
              "spec": {
                "restartPolicy": "OnFailure",
                "initContainers": [
                  {
                    "env": [],
                    "image": `${settings.imagePrefix()}docker-image-builder-init:${settings.buildNumber()}`,
                    "args": [repo.spec.url, repo.spec.branch],
                    "imagePullPolicy": "IfNotPresent",
                    "name": "docker-image-builder",
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
                    "volumeMounts": [
                      {
                        "name": "git-temp",
                        "mountPath": "/gitTemp",
                      },
                      {
                        "name": "docker",
                        "mountPath": "/kaniko/.docker",
                      }
                    ]
                  },
                ],
                "containers": [
                  {
                    "env": [
                    ],
                    "image": "gcr.io/kaniko-project/executor:latest",
                    "args": [
                      `--context=dir:///gitTemp/${spec.contextPath}`,
                      `--dockerfile=${spec.dockerFile}`,
                      `--destination=${spec.imageName}:${latestCommit}`,
                      '--insecure',
                      '--skip-tls-verify',
                      '--skip-tls-verify-pull',
                      '--insecure-pull'
                    ],
                    "imagePullPolicy": "IfNotPresent",
                    "name": "kaniko",
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
                    "volumeMounts": [
                      {
                        "name": "git-temp",
                        "mountPath": "/gitTemp",
                      },
                      // {
                      //   "name": "docker",
                      //   "mountPath": "/kaniko/.docker",
                      // }
                    ]
                  },
                ],
                "volumes": [
                  {
                    "name": "git-temp",
                    "emptyDir": {}
                  },
                  {
                    "name": "docker",
                    "emptyDir": {}
                  },
                ]
              }
            }
          }
        }
      ]
    };

    console.log("dockerImages sync res", JSON.stringify(res));
    response.status(200).json(res);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    console.log("dockerImages customize req", JSON.stringify(request.body));

    var res = {
      "relatedResources": [
        {
          "apiVersion": "jabos.io/v1",
          "resource": "git-repositories",
          "namespace": request.body.parent.metadata.namespace,
          "names": [
            request.body.parent.spec.gitRepository
          ]
        }
      ]
    };

    console.log("dockerImages customize res", JSON.stringify(res));
    response.status(200).json(res);
  }
}
