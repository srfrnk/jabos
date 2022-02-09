import { Request, Response, NextFunction } from 'express';

import genericManifests from './genericManifests'
import { CustomizeRequest, FinalizeRequest, SyncRequest } from './metaControllerHooks';
import { getRepo } from './misc';

export default {
  async sync(syncRequest: Request, response: Response, next: NextFunction) {
    const request: SyncRequest = syncRequest.body;
    genericManifests.debugRequest('kustomize', 'sync', request);

    const repo = getRepo(request);
    const latestCommit = repo.status.latestCommit;
    const spec: any = request.object.spec;
    const namespace = request.object.metadata.namespace;

    // Have to filter, due to the following bug: https://github.com/metacontroller/metacontroller/issues/414
    const dockerImages = Object.values(request.related["DockerImage.jabos.io/v1"] || {}).filter((r: any) => r.metadata.namespace === namespace);
    if (dockerImages.length !== spec.dockerImages.length) {
      // Have to reject the sync to maintain idempotent response - due to: https://github.com/metacontroller/metacontroller/issues/414
      throw new Error(`No DockerImages from same namespace.`);
    }

    const replacementPrefix = spec.replacementPrefix;
    const replacementSuffix = spec.replacementSuffix;
    const replacements = spec.replacements;

    await genericManifests.sync('kustomize', 'kustomize', 'kustomize', {
      'COMMIT': latestCommit,
      'REPLACEMENT_STRINGS': Object.entries(
        replacements).map(replacement => `s/${replacementPrefix}${replacement[0]}${replacementSuffix}/${replacement[1]}/g`
        ).join(';'),
      'IMAGES': JSON.stringify(dockerImages.map((image: any) => ({ "name": image.spec.imageName, "newTag": latestCommit })))
    }, request, response);
  },

  async customize(customizeRequest: Request, response: Response, next: NextFunction) {
    const request: CustomizeRequest = customizeRequest.body;
    genericManifests.debugRequest('kustomize', 'customize', request);

    await genericManifests.customize('kustomize', request, response, [{
      "apiVersion": "jabos.io/v1",
      "resource": "docker-images",
      "namespace": request.parent.metadata.namespace,
      "names": request.parent.spec.dockerImages
    }]);
  },

  async finalize(finalizeRequest: Request, response: Response, next: NextFunction) {
    const request: FinalizeRequest = finalizeRequest.body;
    genericManifests.debugRequest('kustomize', 'finalize', request);

    await genericManifests.finalize('kustomize', request, response);
  }
}
