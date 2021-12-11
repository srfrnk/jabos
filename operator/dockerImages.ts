import { Request, Response, NextFunction } from 'express';
import settings from './settings';
import builderJob from './builderJob';
import { getRepo, k8sName } from './misc';
import { addMetric } from './metrics';
import dockerHubSecretEnv from './dockerHubSecretEnv';
import gcpSecretSources from './gcpSecretSources';
import awsSecretSources from './awsSecretSources';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log("dockerImages sync req", JSON.stringify(request.body));

    var name: string = request.body.object.metadata.name;
    var namespace: string = request.body.object.metadata.namespace;
    var spec: any = request.body.object.spec;
    var builtCommit: string = (request.body.object.metadata.annotations || {}).builtCommit || '';
    var repo = getRepo(request);
    var latestCommit: string = repo.metadata.annotations.latestCommit;

    var jobName = k8sName(`image-${name}`, latestCommit);
    var triggerJob = (!!latestCommit && latestCommit !== builtCommit);

    var res = {
      "annotations": !latestCommit ? {} : {
        "latestCommit": latestCommit
      },
      "attachments": triggerJob ? [
        allowInsecureExecutionForKaniko(builderJob({
          jobName,
          imagePrefix: settings.imagePrefix(),
          buildNumber: settings.buildNumber(),
          commit: latestCommit,
          repoUrl: repo.spec.url,
          repoBranch: repo.spec.branch,
          repoSsh: repo.spec.ssh,
          name,
          namespace,
          serviceAccountName: `builder-${spec.gitRepository}`,
          type: "docker-images",
          metricName: 'dockerImageBuilder',
          metricLabels: { "namespace": namespace, "docker_image": name },
          labels: { type: 'docker-image-builder' },
          containers: [
            {
              "image": `${settings.imagePrefix()}docker-image-builder-init:${settings.buildNumber()}`,
              "args": [spec.imageName, Buffer.from(JSON.stringify(spec.dockerConfig), 'utf-8').toString('base64')],
              "env": dockerHubSecretEnv(spec.dockerHub),
              "name": "docker-image-builder-init",
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
                  "name": "docker",
                  "mountPath": "/kaniko/.docker",
                },
                {
                  "name": "kaniko-secrets",
                  "mountPath": "/secrets",
                  "readOnly": true
                },
                ...(!spec.aws ? [] : [
                  {
                    "name": "aws",
                    "mountPath": "/kaniko/.aws",
                  }
                ])
              ],
            },
            {
              "image": "gcr.io/kaniko-project/executor:latest",
              "args": [
                `--context=dir:///gitTemp/${spec.contextPath}`,
                `--dockerfile=${spec.dockerFile}`,
                `--destination=${spec.imageName}:${latestCommit}`,
                ...(spec.insecureRegistry ? [
                  '--insecure',
                  '--skip-tls-verify',
                  '--skip-tls-verify-pull',
                  '--insecure-pull'
                ] : [])
              ],
              "env": [],
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
                  "readOnly": true
                },
                {
                  "name": "docker",
                  "mountPath": "/kaniko/.docker",
                  "readOnly": true
                },
                ...(!spec.aws ? [] : [
                  {
                    "name": "aws",
                    "mountPath": "/root/.aws/",
                    "readOnly": true
                  }
                ])
              ]
            }
          ],
          volumes: [
            {
              "name": "docker",
              "emptyDir": {}
            },
            {
              "name": "kaniko-secrets",
              "projected": {
                "sources": [...gcpSecretSources(spec.gcp), ...awsSecretSources(spec.aws)]
              }
            },
            ...(!spec.aws ? [] : [
              {
                "name": "aws",
                "emptyDir": {}
              }
            ])
          ]
        }))
      ] : [],
    };

    if (triggerJob) {
      addMetric('dockerImageBuildTrigger', { 'namespace': namespace, 'docker_image': name, 'commit': latestCommit });
    }

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
  },

  async finalize(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log("dockerImages finalize req", JSON.stringify(request.body));

    var res = {
      "annotations": {},
      "attachments": [],
      "finalized": true,
    }

    if (settings.debug()) console.log("dockerImages finalize res", JSON.stringify(res));
    response.status(200).json(res);
  }
}

function allowInsecureExecutionForKaniko(job: any): any {
  var kaniko = job.spec.template.spec.initContainers.filter(container => container.name === "kaniko")[0];
  kaniko.securityContext.runAsNonRoot = false;
  kaniko.securityContext.readOnlyRootFilesystem = false;
  kaniko.securityContext.allowPrivilegeEscalation = true;
  kaniko.securityContext.capabilities.drop = [];
  return job;
}
