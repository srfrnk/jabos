import { Request, Response, NextFunction } from 'express';

import genericManifests from './genericManifests'
import { getRepo } from './misc';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    var repo = getRepo(request);
    var latestCommit = (repo.status || {}).latestCommit;

    var dockerImages = Object.values(request.body.related["DockerImage.jabos.io/v1"] || {});

    var spec: any = request.body.object.spec;

    var replacementPrefix = spec.replacementPrefix;
    var replacementSuffix = spec.replacementSuffix;
    var replacements = spec.replacements;

    var args = [latestCommit,
      Object.entries(
        replacements).map(replacement => `s/${replacementPrefix}${replacement[0]}${replacementSuffix}/${replacement[1]}/g`
        ).join(';'),
      ...dockerImages.map((image: any) => image.spec.imageName)];

    await genericManifests.sync('kustomize', 'kustomize', 'kustomize', args, request, response);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    await genericManifests.customize('kustomize', request, response, [{
      "apiVersion": "jabos.io/v1",
      "resource": "docker-images",
      // "namespace": request.body.parent.metadata.namespace, // Removed due to https://github.com/metacontroller/metacontroller/issues/414
      "names": request.body.parent.spec.dockerImages
    }]);
  },

  async finalize(request: Request, response: Response, next: NextFunction) {
    await genericManifests.finalize('kustomize', request, response);
  }
}
