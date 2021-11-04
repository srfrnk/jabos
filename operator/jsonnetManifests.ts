import { Request, Response, NextFunction } from 'express';

import settings from './settings';
import manifestBuilderJob from './manifestBuilderJob';
import manifestBuilderRole from './manifestBuilderRole';
import manifestBuilderRoleBinding from './manifestBuilderRoleBinding';
import { addJsonnetManifestsBuildTrigger } from './metrics';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log("jsonnetManifests sync req", JSON.stringify(request.body));

    var name: string = request.body.object.metadata.name;
    var namespace: string = request.body.object.metadata.namespace;
    var spec: any = request.body.object.spec;
    var builtCommit: string = (request.body.object.metadata.annotations || {}).builtCommit || '';
    var repo: any = Object.values(request.body.related['GitRepository.jabos.io/v1'])[0];
    var latestCommit: string = repo.metadata.annotations.latestCommit;

    var jsonnetArgs = `--tla-str "${spec.commitTLAKey}=${latestCommit}"`;
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
          type: "jsonnet-manifests",
          metricName: 'jsonnetManifestsBuilder',
          metricLabels: { "namespace": namespace, "jsonnet_manifests": name },
          containers: [
            {
              "image": `${settings.imagePrefix()}jsonnet-manifest-builder:${settings.buildNumber()}`,
              "args": [spec.path, jsonnetArgs],
              "env": [],
              "volumeMounts": [
                {
                  "name": "git-temp",
                  "mountPath": "/gitTemp",
                  "readOnly": true
                }
              ],
              "imagePullPolicy": "IfNotPresent",
              "name": "jsonnet-manifest-builder",
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
      addJsonnetManifestsBuildTrigger(namespace, name, latestCommit);
    }

    if (settings.debug()) console.log("jsonnetManifests sync res", JSON.stringify(res));
    response.status(200).json(res);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log("jsonnetManifests customize req", JSON.stringify(request.body));

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

    if (settings.debug()) console.log("jsonnetManifests customize res", JSON.stringify(res));
    response.status(200).json(res);
  }
}
