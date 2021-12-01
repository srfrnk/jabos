import { Request, Response, NextFunction } from 'express';

import settings from './settings';
import manifestBuilderJob from './manifestBuilderJob';
import manifestBuilderRole from './manifestBuilderRole';
import manifestBuilderRoleBinding from './manifestBuilderRoleBinding';
import { addMetric } from './metrics';
import { getRepo } from './misc';

export default {
  async sync(metricName: string, type: string, metricLabel: string, args: string[], request: Request, response: Response) {
    if (settings.debug()) console.log(`${metricName}Manifests sync req`, JSON.stringify(request.body));

    var name: string = request.body.object.metadata.name;
    var namespace: string = request.body.object.metadata.namespace;
    var spec: any = request.body.object.spec;
    var builtCommit: string = (request.body.object.metadata.annotations || {}).builtCommit || '';
    var repo = getRepo(request);
    var latestCommit: string = repo.metadata.annotations.latestCommit;

    var triggerJob = (!!latestCommit && latestCommit !== builtCommit);

    var attachments = [
      manifestBuilderRole({
        name,
        namespace,
        targetNamespace: spec.targetNamespace
      }),
      manifestBuilderRoleBinding({
        name,
        gitRepositoryName: spec.gitRepository,
        namespace,
        targetNamespace: spec.targetNamespace
      }),
    ];

    var res = {
      "annotations": !latestCommit ? {} : {
        "latestCommit": latestCommit,
      },
      "attachments": (attachments as any[]).concat(triggerJob ? [
        manifestBuilderJob({
          imagePrefix: settings.imagePrefix(),
          buildNumber: settings.buildNumber(),
          commit: latestCommit,
          repoUrl: repo.spec.url,
          repoBranch: repo.spec.branch,
          repoSsh: repo.spec.ssh,
          name,
          namespace,
          gitRepository: spec.gitRepository,
          targetNamespace: spec.targetNamespace,
          type: `${type}-manifests`,
          metricName: `${metricName}ManifestsBuilder`,
          metricLabels: { "namespace": namespace, [`${metricLabel}_manifests`]: name },
          containers: [
            {
              "image": `${settings.imagePrefix()}${type}-manifest-builder:${settings.buildNumber()}`,
              "args": [spec.path].concat(args),
              "env": [],
              "volumeMounts": [
                {
                  "name": "git-temp",
                  "mountPath": "/gitTemp",
                  "readOnly": true
                }
              ],
              "imagePullPolicy": "IfNotPresent",
              "name": `${type}-manifest-builder`,
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
          ]
        })
      ] : [])
    };

    if (triggerJob) {
      addMetric(`${metricName}ManifestsBuildTrigger`, { 'namespace': namespace, [`${metricLabel}_manifests`]: name, 'commit': latestCommit });
    }

    if (settings.debug()) console.log(`${metricName}Manifests sync res`, JSON.stringify(res));
    response.status(200).json(res);
  },

  async customize(metricName: string, request: Request, response: Response) {
    if (settings.debug()) console.log(`${metricName}Manifests customize req`, JSON.stringify(request.body));

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

    if (settings.debug()) console.log(`${metricName}Manifests customize res`, JSON.stringify(res));
    response.status(200).json(res);
  },

  async finalize(metricName: string, request: Request, response: Response) {
    if (settings.debug()) console.log(`${metricName}Manifests finalize req`, JSON.stringify(request.body));

    var res = {
      "annotations": {},
      "attachments": [],
      "finalized": true,
    }

    if (settings.debug()) console.log(`${metricName}Manifests finalize res`, JSON.stringify(res));
    response.status(200).json(res);
  }
}
