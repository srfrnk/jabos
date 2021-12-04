import { Request, Response, NextFunction } from 'express';

import genericManifests from './genericManifests'
import { getRepo } from './misc';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    var repo = getRepo(request);
    var latestCommit: string = repo.metadata.annotations.latestCommit;

    var dockerImages = Object.values(request.body.related["DockerImage.jabos.io/v1"] || {});
    var args = [latestCommit, ...dockerImages.map((image: any) => image.spec.imageName)];

    await genericManifests.sync('kustomize', 'kustomize', 'kustomize', args, request, response);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    await genericManifests.customize('kustomize', request, response, [{
      "apiVersion": "jabos.io/v1",
      "resource": "docker-images",
      "namespace": request.body.parent.metadata.namespace,
      "names": request.body.parent.spec.dockerImages
    }]);
  },

  async finalize(request: Request, response: Response, next: NextFunction) {
    await genericManifests.finalize('kustomize', request, response);
  }
}
