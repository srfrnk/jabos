import { Request, Response, NextFunction } from 'express';
import settings from './settings';
import builderJob from './builderJob';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log("jsonnetManifests sync req", JSON.stringify(request.body));

    var name: string = request.body.object.metadata.name;
    var namespace: string = request.body.object.metadata.namespace;
    var spec: any = request.body.object.spec;
    var builtCommit: string = request.body.object.metadata.annotations.builtCommit;
    var repo: any = Object.values(request.body.related['GitRepository.jabos.io/v1'])[0];
    var latestCommit: string = repo.metadata.annotations.latestCommit;

    var jobName = `manifest-${name}-${latestCommit}`.substring(0, 62);
    var jsonnetArgs = `--tla-str "${spec.commitTLAKey}=${latestCommit}"`;

    var res = {
      "annotations": {
        "lastUpdate": new Date().toISOString(),
        "latestCommit": latestCommit,
      },
      "attachments": latestCommit == builtCommit ? [] : [
        builderJob({
          jobName,
          imagePrefix: settings.imagePrefix(),
          buildNumber: settings.buildNumber(),
          commit: latestCommit,
          name,
          namespace,
          type: "jsonnet-manifests",
          containers: [
            {
              "env": [],
              "image": `${settings.imagePrefix()}jsonnet-manifest-builder:${settings.buildNumber()}`,
              "args": [repo.spec.url, repo.spec.branch, latestCommit, spec.path, spec.targetNamespace, jsonnetArgs],
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
          ],
          volumes: []
        })
      ]
    };

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
