import { Request, Response, NextFunction } from 'express';
import settings from './settings';
import builderJob from './builderJob';
import { k8sName } from './misc';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log("dockerImages sync req", JSON.stringify(request.body));

    var name: string = request.body.object.metadata.name;
    var namespace: string = request.body.object.metadata.namespace;
    var spec: any = request.body.object.spec;
    var builtCommit: string = (request.body.object.metadata.annotations || {}).builtCommit || '';
    var repo: any = Object.values(request.body.related['GitRepository.jabos.io/v1'])[0];
    var latestCommit: string = repo.metadata.annotations.latestCommit;

    var jobName = k8sName(`image-${name}`, latestCommit);

    var res = {
      "annotations": {
        "latestCommit": latestCommit,
        "builtCommit": builtCommit
      },
      "attachments": latestCommit == builtCommit ? [] : [
        builderJob({
          jobName,
          imagePrefix: settings.imagePrefix(),
          buildNumber: settings.buildNumber(),
          commit: latestCommit,
          name,
          namespace,
          type: "docker-images",
          containers: [
            {
              "env": [],
              "image": `${settings.imagePrefix()}docker-image-builder-init:${settings.buildNumber()}`,
              "args": [repo.spec.url, repo.spec.branch, latestCommit, Buffer.from(JSON.stringify(spec.dockerConfig), 'utf-8').toString('base64')],
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
            {
              "env": [],
              "image": "gcr.io/kaniko-project/executor:latest",
              "args": [
                `--context=dir:///gitTemp/${spec.contextPath}`,
                `--dockerfile=${spec.dockerFile}`,
                `--destination=${spec.imageName}:${latestCommit}`
              ].concat(spec.insecureRegistry ? [
                '--insecure',
                '--skip-tls-verify',
                '--skip-tls-verify-pull',
                '--insecure-pull'
              ] : []),
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
                {
                  "name": "docker",
                  "mountPath": "/kaniko/.docker",
                }
              ]
            }
          ],
          volumes: [
            {
              "name": "git-temp",
              "emptyDir": {}
            },
            {
              "name": "docker",
              "emptyDir": {}
            },
          ]
        })
      ]
    };

    if (settings.debug()) console.log("dockerImages sync res", JSON.stringify(res));
    response.status(200).json(res);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log("dockerImages customize req", JSON.stringify(request.body));

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

    if (settings.debug()) console.log("dockerImages customize res", JSON.stringify(res));
    response.status(200).json(res);
  }
}
