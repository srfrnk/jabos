import { Request, Response, NextFunction } from 'express';
import settings from './settings';
import builderJob from './builderJob';
import { Repo, getRepo, k8sName } from './misc';
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
    var latestCommit = (repo.status || {}).latestCommit;

    var jobName = k8sName(`image-${name}`, latestCommit);
    var triggerJob = (!!latestCommit && latestCommit !== builtCommit);

    var [, imageRepositoryHost] = /^([a-z0-9\:\.\-]*)\/(.*)$/.exec(spec.imageName);

    var res = {
      "annotations": !latestCommit ? {} : {
        "latestCommit": latestCommit
      },
      "attachments": triggerJob ? [allowInsecureExecutionForKaniko(spec.build ?
        buildJob(jobName, latestCommit, repo, name, namespace, spec, imageRepositoryHost) :
        reuseJob(jobName, latestCommit, repo, name, namespace, spec, imageRepositoryHost)
      )] : [],
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
          // "namespace": request.body.parent.metadata.namespace, // Removed due to https://github.com/metacontroller/metacontroller/issues/414
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

function buildJob(jobName: string, latestCommit: string, repo: Repo, name: string, namespace: string, spec: any, imageRepositoryHost: string) {
  return builderJob({
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
      imageBuilderInitContainer(spec, imageRepositoryHost),
      kanikoContainer(spec, latestCommit)
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
  });
}

function reuseJob(jobName: string, latestCommit: string, repo: Repo, name: string, namespace: string, spec: any, imageRepositoryHost: string) {
  return builderJob({
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
    labels: { type: 'docker-image-reuser' },
    containers: [
      imageBuilderInitContainer(spec, imageRepositoryHost, `${spec.imageName}:${latestCommit}`),
      reuseContainer(spec, latestCommit),
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
  });
}

function kanikoContainer(spec: any, latestCommit: string): any {
  return {
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
  };
}

function reuseContainer(spec: any, latestCommit: string,): any {
  return {
    "image": "gcr.io/kaniko-project/executor:latest",
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

function imageBuilderInitContainer(spec: any, imageRepositoryHost: string, reuseImage?: string): any {
  return {
    "image": `${settings.imagePrefix()}docker-image-builder-init:${settings.buildNumber()}`,
    "args": [imageRepositoryHost, reuseImage || 'BUILD_IMAGE', Buffer.from(JSON.stringify(spec.dockerConfig), 'utf-8').toString('base64')],
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
  var kaniko = job.spec.template.spec.initContainers.filter(container => container.name === "kaniko")[0];
  kaniko.securityContext.runAsNonRoot = false;
  kaniko.securityContext.readOnlyRootFilesystem = false;
  kaniko.securityContext.allowPrivilegeEscalation = true;
  kaniko.securityContext.capabilities.drop = [];
  return job;
}
