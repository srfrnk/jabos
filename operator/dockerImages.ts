import { Request, Response, NextFunction } from 'express';
import settings from './settings';
import builderJob from './builderJob';
import { Repo, getRepo, debugId, needNewBuild, getExistingJob } from './misc';
import { addMetric } from './metrics';
import dockerHubSecretEnv from './dockerHubSecretEnv';
import gcpSecretSources from './gcpSecretSources';
import awsSecretSources from './awsSecretSources';
import { CustomizeRequest, CustomizeResponse, FinalizeRequest, FinalizeResponse, SyncRequest, SyncResponse } from './metaControllerHooks';

export default {
  async sync(syncRequest: Request, response: Response, next: NextFunction) {
    const request: SyncRequest = syncRequest.body;
    if (settings.debug()) console.log(`dockerImages sync req (${debugId(request)})`, JSON.stringify(request));

    const object = request.object;
    const repo = getRepo(request);
    const triggerJob = needNewBuild(request);

    const res: SyncResponse = triggerJob ?
      {
        "attachments": [allowInsecureExecutionForKaniko(object.spec.build ?
          buildJob(object, repo) :
          reuseJob(object, repo)
        )],
        "status": {
          "conditions": [
            {
              "type": "Synced",
              "status": "False",
            },
          ],
        }
      } :
      {
        "attachments": getExistingJob(request)
      };

    if (triggerJob) {
      addMetric('dockerImageBuildTrigger', { 'namespace': object.metadata.namespace, 'docker_image': object.metadata.name, 'commit': repo.status.latestCommit });
    }

    if (settings.debug()) console.log(`dockerImages sync res (${debugId(request)})`, JSON.stringify(res));
    response.status(200).json(res);
  },

  async customize(customizeRequest: Request, response: Response, next: NextFunction) {
    const request: CustomizeRequest = customizeRequest.body;
    if (settings.debug()) console.log(`dockerImages customize req (${debugId(request)})`, JSON.stringify(request));

    const res: CustomizeResponse = {
      "relatedResources": [
        {
          "apiVersion": "jabos.io/v1",
          "resource": "git-repositories",
          "namespace": request.parent.metadata.namespace,
          "names": [
            request.parent.spec.gitRepository
          ]
        }
      ]
    };

    if (settings.debug()) console.log(`dockerImages customize res (${debugId(request)})`, JSON.stringify(res));
    response.status(200).json(res);
  },

  async finalize(finalizeRequest: Request, response: Response, next: NextFunction) {
    const request: FinalizeRequest = finalizeRequest.body;
    if (settings.debug()) console.log(`dockerImages finalize req (${debugId(request)})`, JSON.stringify(request));

    const res: FinalizeResponse = {
      "annotations": {},
      "attachments": [],
      "finalized": true,
    }

    if (settings.debug()) console.log(`dockerImages finalize res (${debugId(request)})`, JSON.stringify(res));
    response.status(200).json(res);
  }
}

function buildJob(object: any, repo: Repo) {
  return builderJob({
    object,
    repo,
    jobNamePrefix: "image",
    imagePrefix: settings.imagePrefix(),
    buildNumber: settings.buildNumber(),
    serviceAccountName: `builder-${object.spec.gitRepository}`,
    type: "docker-images",
    metricName: 'dockerImageBuilder',
    metricLabels: { "namespace": object.metadata.namespace, "docker_image": object.metadata.name },
    labels: { type: 'docker-image-builder' },
    containers: [
      imageBuilderInitContainer(object.spec, object.namespace, object.name, object.uid),
      kanikoContainer(object.spec, repo.status.latestCommit)
    ],
    volumes: [
      {
        "name": "docker",
        "emptyDir": {}
      },
      {
        "name": "kaniko-secrets",
        "projected": {
          "sources": [...gcpSecretSources(object.spec.gcp), ...awsSecretSources(object.spec.aws)]
        }
      },
      ...(!object.spec.aws ? [] : [
        {
          "name": "aws",
          "emptyDir": {}
        }
      ])
    ]
  });
}

function reuseJob(object: any, repo: Repo) {
  return builderJob({
    object,
    jobNamePrefix: "image",
    imagePrefix: settings.imagePrefix(),
    buildNumber: settings.buildNumber(),
    repo,
    serviceAccountName: `builder-${object.spec.gitRepository}`,
    type: "docker-images",
    metricName: 'dockerImageBuilder',
    metricLabels: { "namespace": object.metadata.namespace, "docker_image": object.metadata.name },
    labels: { type: 'docker-image-reuser' },
    containers: [
      imageBuilderInitContainer(object.spec, object.metadata.namespace, object.metadata.name, object.metadata.uid, `${object.spec.imageName}:${repo.status.latestCommit}`),
      reuseContainer(object.spec, repo.status.latestCommit),
    ],
    volumes: [
      {
        "name": "docker",
        "emptyDir": {}
      },
      {
        "name": "reuse",
        "emptyDir": {}
      },
      {
        "name": "kaniko-secrets",
        "projected": {
          "sources": [...gcpSecretSources(object.spec.gcp), ...awsSecretSources(object.spec.aws)]
        }
      },
      ...(!object.spec.aws ? [] : [
        {
          "name": "aws",
          "emptyDir": {}
        }
      ])
    ]
  });
}

function kanikoContainer(spec: any, latestCommit: string): any {
  return {
    "image": `${settings.imagePrefix()}kaniko:${settings.buildNumber()}`,
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
    "stdin": true,
    "tty": true,
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
  };
}

function reuseContainer(spec: any, latestCommit: string,): any {
  return {
    "image": `${settings.imagePrefix()}kaniko:${settings.buildNumber()}`,
    "args": [
      `--context=dir:///reuse`,
      `--dockerfile=Dockerfile`,
      ...(spec.insecureRegistry ? [
        '--insecure',
        '--skip-tls-verify',
        '--skip-tls-verify-pull',
        '--insecure-pull',
        '--no-push'
      ] : [])
    ],
    "stdin": true,
    "tty": true,
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
        "name": "reuse",
        "mountPath": "/reuse",
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
}

function imageBuilderInitContainer(spec: any, namespace: string, name: string, uid: string, reuseImage?: string): any {
  const [, imageRepositoryHost] = /^([a-z0-9\:\.\-_]*)\/(.*)$/.exec(spec.imageName) || ['', ''];
  return {
    "image": `${settings.imagePrefix()}docker-image-builder-init:${settings.buildNumber()}`,
    "args": [],
    "env": [
      {
        "name": "HOST",
        "value": imageRepositoryHost
      },
      {
        "name": "REUSE_IMAGE",
        "value": reuseImage || 'BUILD_IMAGE'
      },
      {
        "name": "DOCKER_CONFIG",
        "value": JSON.stringify(spec.dockerConfig)
      },
      ...dockerHubSecretEnv(spec.dockerHub)],
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
      ...(!!reuseImage ? [{
        "name": "reuse",
        "mountPath": "/reuse",
      }] : []),
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
  };
}

function allowInsecureExecutionForKaniko(job: any): any {
  const kaniko = job.spec.template.spec.initContainers.filter(container => container.name === "kaniko")[0];
  kaniko.securityContext.runAsNonRoot = false;
  kaniko.securityContext.readOnlyRootFilesystem = false;
  kaniko.securityContext.allowPrivilegeEscalation = true;
  kaniko.securityContext.capabilities.drop = [];
  return job;
}
