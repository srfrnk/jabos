import { Request, Response, NextFunction } from 'express';

import genericManifests from './genericManifests'
import { getRepo } from './misc';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    var repo = getRepo(request);
    var latestCommit = (repo.status || {}).latestCommit;
    var spec: any = request.body.object.spec;
    var namespace = request.body.object.metadata.namespace;

    // Have to filter, due to the following bug: https://github.com/metacontroller/metacontroller/issues/414
    var dockerImages = Object.values(request.body.related["DockerImage.jabos.io/v1"] || {}).filter((r: any) => r.metadata.namespace === namespace);
    if (dockerImages.length !== spec.dockerImages.length) {
      // Have to reject the sync to maintain idempotent response - due to: https://github.com/metacontroller/metacontroller/issues/414
      throw new Error(`No DockerImages from same namespace.`);
    }

    var replacementPrefix = spec.replacementPrefix;
    var replacementSuffix = spec.replacementSuffix;
    var replacements = spec.replacements;

    await genericManifests.sync('kustomize', 'kustomize', 'kustomize', {
      'COMMIT': latestCommit,
      'REPLACEMENT_STRINGS': Object.entries(
        replacements).map(replacement => `s/${replacementPrefix}${replacement[0]}${replacementSuffix}/${replacement[1]}/g`
        ).join(';'),
      'IMAGES': JSON.stringify(dockerImages.map((image: any) => ({ "name": image.spec.imageName, "newTag": latestCommit })))
    }, request, response);
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
